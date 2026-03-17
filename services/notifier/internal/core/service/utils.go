package service

import (
	"fmt"
	"notifier/internal/core/domain"
	"strings"
	"time"
)

func createBodyMessage(alarmID int, data domain.ReportData) string {
	dataTime := ""
	if data.LastPulse != nil {
		timestamp, _ := time.Parse(time.RFC3339, *data.LastPulse)
		loc, _ := time.LoadLocation("Europe/Rome")
		dataTime = timestamp.In(loc).Format(time.DateTime)
	}

	var body = fmt.Sprintf("\n🆔 *ID Allarme*: %d\n", alarmID)

	body += fmt.Sprintf("\n✏️ *Nome*: %s", data.HostName)
	body += fmt.Sprintf("\n📡 *Indirizzo IP*: %s", data.HostIP)
	body += fmt.Sprintf("\n🕒 *Orario*: %s", dataTime)

	if data.Impact.ChildrenCount > 0 {
		body += "\n\n---\n\n"
		body += fmt.Sprintf("⏬ *Nodi figli coinvolti (%d):*",
			data.Impact.ChildrenCount)

		for _, host := range data.Impact.ChildrenHosts {
			body = fmt.Sprintf("%s\n- %s (%s)",
				body, host.Name, host.IPAddress)
		}
	}

	body = strings.Replace(body, "-", "\\-", -1)
	body = strings.Replace(body, ".", "\\.", -1)
	body = strings.Replace(body, "(", "\\(", -1)
	body = strings.Replace(body, ")", "\\)", -1)
	body = strings.Replace(body, "+", "\\+", -1)

	return body
}
