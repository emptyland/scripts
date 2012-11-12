package main

import (
	"./packet"
	"fmt"
	"net"
	"os"
	"runtime"
	"time"
)

const (
	maxAppleHost = 2000
	numOfCore = 1
	hostPerCore = maxAppleHost / numOfCore
)

type pingResult struct {
	Duration *time.Duration
	Hostname string
	Error    error
}

func pingRoutine(queue chan *pingResult, begin, end int) {
	retrySleepTime, _ := time.ParseDuration("500ms")

	for i := begin; i < end; i++ {
		hostname := fmt.Sprint("a", i, ".phobos.apple.com")
		var duration *time.Duration
		var err error
		for j := 0; j < 3; j++ { // retry 3 times
			duration, err = ping(hostname, uint16(i))
			if err != nil {
				time.Sleep(retrySleepTime)
				continue
			}
			break
		}
		queue <- &pingResult{
			Duration: duration,
			Error:    err,
			Hostname: hostname,
		}
	}
}

func ping(host string, sequence uint16) (*time.Duration, error) {
	timeout, _ := time.ParseDuration("2000ms")
	conn, err := net.DialTimeout("ip4:icmp", host, timeout)
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	conn.SetDeadline(time.Now().Add(timeout))

	// ICMP protocol
	request := packet.IcmpPacket{
		Type:      0x08,
		Code:      0x00,
		ID:        0xae16,
		Sequence:  sequence,
		Timestamp: time.Now().Unix(),
		Data:      packet.PingData,
	}
	t0 := time.Now()
	var wbuf []byte
	if wbuf, err = request.Serialize(); err != nil {
		return nil, err
	}
	if _, err = conn.Write(wbuf); err != nil {
		return nil, err
	}
	rbuf := make([]byte, 80)
	if _, err = conn.Read(rbuf); err != nil {
		return nil, err
	}
	duration := time.Now().Sub(t0)
	reponse := packet.IcmpPacket{}
	if _, err = reponse.Parse(rbuf); err != nil {
		return nil, err
	}
	// ICMP reponse verify
	if reponse.Type != 0x00 ||
		reponse.Code != 0x00 ||
		reponse.ID != request.ID ||
		reponse.Sequence != request.Sequence {
		return nil, fmt.Errorf(
			"Bad icmp reponse. seq %d vs %d",
			reponse.Sequence, request.Sequence)
	}
	return &duration, nil
}

func main() {
	runtime.GOMAXPROCS(numOfCore)

	file, err := os.Create("app_host_list.txt")
	if err != nil {
		fmt.Println(err)
	}
	queue := make(chan *pingResult)
	for i := 0; i < numOfCore; i++ {
		go pingRoutine(queue, i*hostPerCore, (i+1)*hostPerCore)
	}
	succ := 0.0
	var fastDuration *time.Duration
	var fastHostname string
	for i := 0; i < maxAppleHost; i++ {
		result := <-queue
		if result.Error == nil {
			succ = succ + 1
			if fastDuration == nil ||
				result.Duration.Nanoseconds() < fastDuration.Nanoseconds() {
				fastDuration = result.Duration
				fastHostname = result.Hostname
			}
			file.WriteString(fmt.Sprint(result.Duration, "\t", result.Hostname, "\n"))
		}
		if i%100 == 0 {
			fmt.Printf(". %d ", i)
		}
	}
	fmt.Println("\nSucceeded: ", succ/maxAppleHost)
	fmt.Println("Fast: ", fastHostname, " Duration: ", fastDuration)
}
