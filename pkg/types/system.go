package types

import (
	"fmt"
)

type TreeNode struct {
	Value    *Host
	Children []*TreeNode
}

func (node *TreeNode) AddChildren(host *Host) {
	node.Children = append(node.Children,
		&TreeNode{
			Value:    host,
			Children: []*TreeNode{},
		})
}

func (node *TreeNode) DeepFirstSearch(ipAddress string) *TreeNode {
	if node.Value.IPAddress == ipAddress {
		return node
	}

	for _, child := range node.Children {
		newNode := child.DeepFirstSearch(ipAddress)
		if newNode != nil {
			return newNode
		}
	}

	return nil
}

func (root *TreeNode) ParseFromArray(hosts []Host) error {
	*root = TreeNode{
		Value:    &hosts[0],
		Children: []*TreeNode{},
	}

	if root.Value.ParentIP.Valid {
		return fmt.Errorf("ParseFromArray: hosts list hasn't a valid root node")
	}

	for i := 1; i < len(hosts); i++ {
		node := root.DeepFirstSearch(hosts[i].ParentIP.String)
		node.AddChildren(&hosts[i])
	}

	return nil
}

func (root *TreeNode) ParseToArray() []Host {
	var hosts = []Host{}

	hosts = append(hosts, *root.Value)

	for _, child := range root.Children {
		hosts = append(hosts, child.ParseToArray()...)
	}

	return hosts
}
