import { EventBridgeEvent } from "aws-lambda";
import { DynamoDBService, enhancedSQSHandler, logError, mapToMarketingSetStatusTagEvent, logInfo, publishEvent } from "honeydew-shared";
import { CalendlyWebhookEvent } from "honeydew-shared/types";

export const handler = enhancedSQSHandler(async (event) => {
  // TODO: handle other cases (not only creation of apt)
  const { detail: appointment }: EventBridgeEvent<string, CalendlyWebhookEvent> =
    JSON.parse(event.Records[0].body);

  const patientId = appointment.payload.tracking.utm_source;

  if (!patientId) {
    const message = "Patient ID not found";
    logError(message);
    throw new Error(message);
  }

  const oldAppointmentId = appointment.payload.tracking.utm_medium;
    const isMeetingWithPatient = appointment.payload.tracking.utm_term
      ? JSON.parse(appointment.payload.tracking.utm_term).isMeeting
      : false;

    if (isMeetingWithPatient) {
      logInfo(
        "Patient did submit a meeting with provider. Removing meeting scheduling link"
      );
      // TODO: implement
      // await DynamoDBService.patients.setMeetingLink(patientId, null);
      return;
    }

  const timestamp = new Date().getTime();

  await DynamoDBService.appointments.create({
    patientId: `${appointment.payload.tracking.utm_source}`,
    appointmentId: appointment.payload.event.uuid,
    timestamp,
    startTime: appointment.payload.event.invitee_start_time,
    endTime: appointment.payload.event.invitee_end_time,
    history: [
      {
        status: "PENDING",
        timestamp,
        appointmentId: appointment.payload.event.uuid,
      },
    ],
  });

  const eventPayload = mapToMarketingSetStatusTagEvent({ patientId: `${appointment.payload.tracking.utm_source}`, isActive:  })

  await publishEvent(eventPayload.payload, eventPayload.eventType)
});
