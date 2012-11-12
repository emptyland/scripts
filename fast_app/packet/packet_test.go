package packet

import (
	"testing"
	"time"
)

func TestFoo(t *testing.T) {
	ts := time.Now().Unix()
	p := IcmpPacket{
		Type:      8,
		Code:      0,
		ID:        0xae16,
		Sequence:  0x0001,
		Timestamp: ts,
		Data:      PingData,
	}

	var packed []byte
	var err error
	if packed, err = p.Serialize(); err != nil {
		t.Error(err)
	}

	x := IcmpPacket{}
	x.Parse(packed)
	if x.Type != p.Type {
		t.Fail()
	}
	if x.Code != p.Code {
		t.Fail()
	}
	if x.ID != p.ID {
		t.Fail()
	}
	if x.Sequence != p.Sequence {
		t.Fail()
	}
	if !x.DataVerify() {
		t.Error(x.Data, len(x.Data))
		t.Error("!x.DataVerify()")
	}
}
