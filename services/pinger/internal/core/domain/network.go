package domain

import "sync"

const (
	StatusDown        = "DOWN"
	StatusUnreachable = "UNREACHABLE"
	StatusPending     = "PENDING"
	StatusMantainance = "MANTAINANCE"
	StatusUp          = "UP"
)

type Host struct {
	Data     HostDTO
	Children []*Host
	Mutex    sync.Mutex
}

func NewHost(data HostDTO) *Host {
	return &Host{
		Data:     data,
		Children: make([]*Host, 0),
		Mutex:    sync.Mutex{},
	}
}

func (h *Host) IsReconnected(oldStatus string) bool {
	return h.Data.Status == StatusUp && oldStatus == StatusDown
}

func (h *Host) IsDisconnected(oldStatus string) bool {
	return h.Data.Status == StatusDown && oldStatus != StatusDown
}

type Network struct {
	Roots  []*Host          // If exists more than one root node in the network
	Lookup map[string]*Host // Direct access
	Mutex  sync.Mutex
}

func NewNetwork(hosts []HostDTO) *Network {
	var lookup = make(map[string]*Host)
	var roots []*Host

	//? Create the map to direct access to hosts
	for _, host := range hosts {
		lookup[host.IPAddress] = NewHost(host)
	}

	//? Define the network topology
	for _, host := range hosts {
		currentNode := lookup[host.IPAddress]

		if currentNode.Data.ParentIP.Valid && currentNode.Data.ParentIP.String != "" {
			if parentNode, exists := lookup[host.ParentIP.String]; exists {
				parentNode.Children = append(parentNode.Children, currentNode)
			}
		} else {
			roots = append(roots, currentNode)
		}
	}

	return &Network{
		Roots:  roots,
		Lookup: lookup,
		Mutex:  sync.Mutex{},
	}
}

func (n *Network) ParseToArray() []HostDTO {
	n.Mutex.Lock()
	defer n.Mutex.Unlock()

	var hosts = make([]HostDTO, 0)

	for _, host := range n.Lookup {
		hosts = append(hosts, host.Data)
	}

	return hosts
}
