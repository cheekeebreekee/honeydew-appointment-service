import axios from "axios";
import {
  AppointmentServiceConfig,
  CalendlySingleUseLinkResponse,
  logInfo,
} from "honeydew-shared";

export async function getSingleUseEventLink(
  eventUri: string,
  config: AppointmentServiceConfig
) {
  logInfo("Getting Calendly single use link", {
    eventUri,
  });
  const { data } = await axios.post<CalendlySingleUseLinkResponse>(
    `${config.calendly.baseUrl}/scheduling_links`,
    {
      max_event_count: 1,
      owner: eventUri,
      owner_type: "EventType",
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.calendly.apiToken}`,
      },
    }
  );
  logInfo("Calendly single use link obtained", data);
  return data;
}
