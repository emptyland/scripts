package packet

import (
	"bytes"
)

type IcmpPacket struct {
	Type      byte
	Code      byte
	Checksum  uint16
	ID        uint16
	Sequence  uint16
	Timestamp int64
	Data      []byte
}

func (p *IcmpPacket) checkSum(flat []byte) uint16 {
	p.Checksum = 0
	var sum uint16 = 0
	for i := 0; i < len(flat); i += 2 {
		var val uint16 = uint16(flat[i]) | (uint16(flat[i + 1]) << 8)
		sum += val
	}
	if len(flat) % 2 == 1 {
		sum += uint16(flat[len(flat)-1])
	}
	sum += 4
	p.Checksum = ^sum
	return p.Checksum
}

func (p *IcmpPacket) Serialize() ([]byte, error) {
	buf := new(bytes.Buffer)
	buf.WriteByte(p.Type)
	buf.WriteByte(p.Code)
	writeUint16(buf, p.Checksum)
	writeUint16(buf, p.ID)
	writeUint16(buf, p.Sequence)
	writeInt64(buf, p.Timestamp)
	if p.Data != nil {
		buf.Write(p.Data)
	}
	p.checkSum(buf.Bytes())
	rv := buf.Bytes()
	rv[2] = (byte)(p.Checksum & 0x00ff)
	rv[3] = (byte)((p.Checksum & 0xff00) >> 8)
	return rv, nil
}

func (p *IcmpPacket) Parse(flat []byte) (*IcmpPacket, error) {
	buf := bytes.NewBuffer(flat)
	p.Type, _ = buf.ReadByte()      // 1
	p.Code, _ = buf.ReadByte()      // 1
	p.Checksum, _ = readUint16(buf) // 2
	p.ID, _ = readUint16(buf)       // 2
	p.Sequence, _ = readUint16(buf) // 2
	p.Timestamp, _ = readInt64(buf) // 8
	p.Data = make([]byte, len(flat)-16)
	buf.Read(p.Data)
	return p, nil
}

func (p *IcmpPacket) DataVerify() bool {
	return bytes.Compare(p.Data, PingData) == 0
}

func writeUint16(b *bytes.Buffer, i uint16) error {
	b.WriteByte((byte)(i & 0x00ff))
	b.WriteByte((byte)((i & 0xff00) >> 8))
	return nil
}

func readUint16(b *bytes.Buffer) (uint16, error) {
	var i uint16 = 0
	var n byte = 0
	n, _ = b.ReadByte()
	i |= uint16(n)
	n, _ = b.ReadByte()
	i |= uint16(n) << 8
	return i, nil
}

func writeInt64(b *bytes.Buffer, num int64) error {
	for i := uint(0); i < 64; i += 8 {
		n := byte((num & (0xff << i)) >> i)
		if err := b.WriteByte(n); err != nil {
			return err
		}
	}
	return nil
}

func readInt64(b *bytes.Buffer) (int64, error) {
	var num int64 = 0
	for i := uint(0); i < 64; i += 8 {
		var n byte = 0
		var err error = nil
		if n, err = b.ReadByte(); err != nil {
			return 0, err
		}
		num |= (int64(n) << i)
	}
	return num, nil
}

var PingData = []byte{
	0xc7, 0x4c, 0x0d, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x11, 0x12, 0x13,
	0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
	0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b,
	0x2c, 0x2d, 0x2e, 0x2f, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
}
