package domain

type AddHostsRequest struct {
	Hosts []NewHost `json:"hosts" validate:"required,min=1,dive"`
}

type NewHost struct {
	Name      string  `json:"name" validate:"required,min=2,max=100"`
	IPAddress string  `json:"ip_address" validate:"required,ip"`
	ParentIP  *string `json:"parent_ip" validate:"omitempty,ip"`
	Note      *string `json:"note" validate:"omitempty,max=500"`
}

type Host struct {
	ID                 int      `json:"id" validate:"required,gt=0"`
	Name               string   `json:"name" validate:"required,min=2,max=100"`
	IPAddress          string   `json:"ip_address" validate:"required,ip"`
	Status             string   `json:"status" validate:"required,oneof=online offline warning unknown"`
	AddedAt            string   `json:"added_at" validate:"required,datetime=2006-01-02T15:04:05Z07:00"`
	LastPing           *string  `json:"last_ping" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
	LastPulse          *string  `json:"last_pulse" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
	ParentIP           *string  `json:"parent_ip" validate:"omitempty,ip"`
	Note               *string  `json:"note" validate:"omitempty,max=500"`
	PingsCount         int      `json:"pings_count" validate:"gte=0"`
	DisconnectionCount int      `json:"disconnection_count" validate:"gte=0"`
	AverageLatency     *float64 `json:"average_latency" validate:"omitempty,gte=0"`
	AveragePacketLoss  *float64 `json:"average_packet_loss" validate:"omitempty,gte=0,lte=100"`
}

type DeleteRequest struct {
	IDs []int `json:"ids" validate:"required,min=1,dive,gt=0"`
}

type UpdateHostsRequest struct {
	Hosts []Host `json:"hosts" validate:"required,min=1,dive"`
}

type UpdateConfigsRequest struct {
	Configs BusinessConfig `json:"configs" validate:"required"`
}

type Alarm struct {
	ID          int         `json:"id"`
	HostIP      string      `json:"host_ip"`
	Status      string      `json:"status"`
	StartedAt   string      `json:"started_at"`            //? datetime=2006-01-02T15:04:05Z07:00
	ResolvedAt  *string     `json:"resolved_at,omitempty"` //? datetime=2006-01-02T15:04:05Z07:00
	MessageInfo MessageInfo `json:"message_info"`
}

type ResponseError struct {
	Error   string      `json:"error"`
	Details interface{} `json:"details"`
}
