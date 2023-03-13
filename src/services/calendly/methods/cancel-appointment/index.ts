import axios from "axios";
import { AppointmentServiceConfig, logInfo } from "honeydew-shared";

export async function cancelAppointment(
  uuid: string,
  config: AppointmentServiceConfig
) {
  logInfo("Cancelling Calendly event", {
    uuid,
  });
  try {
    const { data } = await axios.post(
      `${config.calendly.baseUrl}/scheduled_events/${uuid}/cancellation`,
      {
        reason: "[Honeydew Bot] Another initial appointment scheduled",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.calendly.apiToken}`,
        },
      }
    );
    logInfo("Calendly appointment cancellation response", data);
    return data;
  } catch (e: any) {
    if (e.response.status === 403) {
      logInfo(
        "Unable to cancel an appointment for some reason",
        e.response.data
      );
      return null;
    }
    logInfo("Error occured", e);
    throw new Error("Error while cancelling an appointment");
  }
}
