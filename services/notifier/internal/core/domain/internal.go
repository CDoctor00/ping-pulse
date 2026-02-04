package domain

type MessageData struct {
	ChatID   int64
	Body     string
	Keyboard *MessageKeyboard
}

type MessageKeyboard struct {
	Text   string
	Action string
}
