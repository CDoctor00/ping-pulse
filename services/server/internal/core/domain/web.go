package domain

type AddHostsRequest struct {
	Hosts []NewHost `json:"hosts" validate:"required,min=1,dive"`
}

type NewHost struct {
	Name      string  `json:"name" validate:"required,min=2,max=255"`
	IPAddress string  `json:"ipAddress" validate:"required,ip"`
	ParentIP  *string `json:"parentIP" validate:"omitempty,ip"`
	Note      *string `json:"note" validate:"omitempty,max=500"`
}

type Host struct {
	ID                 int      `json:"id" validate:"required,gt=0"`
	Name               string   `json:"name" validate:"required,min=1,max=255"`
	IPAddress          string   `json:"ipAddress" validate:"required,ip"`
	Status             string   `json:"status" validate:"required,oneof=UP PENDING DOWN UNREACHABLE MAINTENANCE"`
	AddedAt            string   `json:"addedAt" validate:"required,datetime=2006-01-02T15:04:05Z07:00"`
	LastPing           *string  `json:"lastPing" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
	LastPulse          *string  `json:"lastPulse" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
	ParentIP           *string  `json:"parentIP" validate:"omitempty,ip"`
	Note               *string  `json:"note" validate:"omitempty,max=500"`
	PingsCount         int      `json:"pingsCount" validate:"gte=0"`
	DisconnectionCount int      `json:"disconnectionCount" validate:"gte=0"`
	AverageLatency     *float64 `json:"averageLatency" validate:"omitempty,gte=0"`
	AveragePacketLoss  *float64 `json:"averagePacketLoss" validate:"omitempty,gte=0,lte=100"`
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
	ID          int         `json:"id" validate:"required,gt=0"`
	HostIP      string      `json:"hostIP" validate:"required,ip"`
	Status      string      `json:"status" validate:"required,oneof=PENDING ACKNOWLEDGED RESOLVED"`
	ChildrenID  []int64     `json:"childrenID" validate:"required"`
	StartedAt   string      `json:"startedAt" validate:"required,datetime=2006-01-02T15:04:05Z07:00"`
	ResolvedAt  *string     `json:"resolvedAt" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"` //? datetime=2006-01-02T15:04:05Z07:00
	MessageInfo MessageInfo `json:"messageInfo" validate:"required,dive"`
}

type ResponseError struct {
	Error   string      `json:"error"`
	Details interface{} `json:"details"`
}
