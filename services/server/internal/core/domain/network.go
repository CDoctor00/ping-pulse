package domain

import "sync"

const (
	StatusDown        = "DOWN"
	StatusUnreachable = "UNREACHABLE"
	StatusPending     = "PENDING"
	StatusMaintenance = "MAINTENANCE"
	StatusUp          = "UP"
)

type NetworkHost struct {
	data     HostDTO
	children []*NetworkHost
	mutex    sync.Mutex
}

func (h *NetworkHost) SwitchMaintenanceStatus(isMaintenance bool) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	if isMaintenance {
		h.data.Status = StatusMaintenance
	} else if h.data.Status == StatusMaintenance {
		h.data.Status = StatusUp
	}

	for _, c := range h.children {
		c.SwitchMaintenanceStatus(isMaintenance)
	}
}

type Network struct {
	Roots  []*NetworkHost          // If exists more than one root node in the network
	Lookup map[string]*NetworkHost // Direct access
	Mutex  sync.Mutex
}

func NewNetwork(hosts []HostDTO) *Network {
	var lookup = make(map[string]*NetworkHost)
	var roots []*NetworkHost

	//? Create the map to direct access to hosts
	for _, host := range hosts {
		lookup[host.IPAddress] = &NetworkHost{
			data:     host,
			children: make([]*NetworkHost, 0),
			mutex:    sync.Mutex{},
		}
	}

	//? Define the network topology
	for _, host := range hosts {
		currentNode := lookup[host.IPAddress]

		if currentNode.data.ParentIP.Valid && currentNode.data.ParentIP.String != "" {
			if parentNode, exists := lookup[host.ParentIP.String]; exists {
				parentNode.children = append(parentNode.children, currentNode)
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
		hosts = append(hosts, host.data)
	}

	return hosts
}
