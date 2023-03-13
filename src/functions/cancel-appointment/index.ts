import { EventBridgeEvent } from "aws-lambda";
import {
  CalendlyWebhookEvent,
  enhancedSQSHandler,
  logError,
  logInfo,
  mapToMarketingSetStatusTagEvent,
  PatientsService,
  publishEvent,
} from "honeydew-shared";
import { DynamoDBService } from "../../services/dynamodb";

export const handler = enhancedSQSHandler(async (event) => {
  const {
    detail: appointment,
  }: EventBridgeEvent<string, CalendlyWebhookEvent> = JSON.parse(
    event.Records[0].body
  );

  const patientId = appointment.payload.tracking.utm_source;
  const appointmentId = appointment.payload.event.uuid;

  if (!patientId) {
    const message = "Patient id not provided";
    logError(message);
    throw new Error(message);
  }

  if (appointment.payload.event_type.slug !== "acne-consultation") {
    logInfo("Cancelled event is not an initial appointment. Skip");
  }

  const patient = await PatientsService.getPatient(patientId);

  await DynamoDBService.appointments.setAppointmentStatus(
    appointmentId,
    "cancelled"
  );

  const cancelledStatusTag = mapToMarketingSetStatusTagEvent({
    patientId,
    tag: "Cancelled",
    add: true,
  });

  await publishEvent(
    JSON.stringify(cancelledStatusTag.payload),
    cancelledStatusTag.eventType
  );

  // const provider = await DynamoDBService.providers.get(patient.provider_id);

  // if (!provider) {
  //   const message = "Cannot find provider for patient";
  //   logError(message, patient);
  //   throw new Error(message);
  // }

  // await Notify.SMS.Provider.cancelledAppointment(provider, patient);
});
