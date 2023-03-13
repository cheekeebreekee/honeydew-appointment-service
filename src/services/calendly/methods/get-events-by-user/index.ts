import axios from "axios";
import {
  AppointmentServiceConfig,
  CalendlyCollection,
  CalendlyEventType,
  logInfo,
} from "honeydew-shared";

async function nextPage(
  userUri: string,
  config: AppointmentServiceConfig,
  nextPageUrl?: string
): Promise<CalendlyEventType[]> {
  const { data } = await axios.get<CalendlyCollection<CalendlyEventType>>(
    nextPageUrl || `${config.calendly.baseUrl}/event_types`,
    {
      params: {
        organization: config.calendly.organization,
        user: userUri,
        active: true,
      },
      headers: {
        Authorization: `Bearer ${config.calendly.apiToken}`,
      },
    }
  );

  return [
    ...data.collection,
    ...(data.pagination.next_page
      ? await nextPage(userUri, config, data.pagination.next_page)
      : []),
  ];
}

export async function getEventTypesByUser(
  userUri: string,
  config: AppointmentServiceConfig
) {
  logInfo("Getting Calendly event types related to user", {
    userUri,
  });
  const calendlyEvents = await nextPage(userUri, config);
  logInfo("Event types found", calendlyEvents);
  return calendlyEvents;
}
