import { EventBridgeEvent } from "aws-lambda";
import {
  enhancedSQSHandler,
  logError,
  mapToMarketingSetStatusTagEvent,
  logInfo,
  publishEvent,
  AppointmentService,
  config,
  Notify,
  mapToAppointmentScheduledFbEvent,
  PatientsService,
} from "honeydew-shared";
import {
  AppointmentServiceConfig,
  CalendlyWebhookEvent,
} from "honeydew-shared/types";
import { DynamoDBService } from "src/services/dynamodb";

export const handler = enhancedSQSHandler(async (event) => {
  // TODO: handle other cases (not only creation of apt)
  const {
    detail: appointment,
  }: EventBridgeEvent<string, CalendlyWebhookEvent> = JSON.parse(
    event.Records[0].body
  );

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

  const patient = await PatientsService.getPatient(patientId);

  const appointments = await DynamoDBService.appointments.getByPatientId(
    patientId
  );

  if (appointments.length) {
    logInfo("Patient wants to resubmit an appointment");
    if (oldAppointmentId) {
      logInfo("There is an old appointment that should be cancelled");
      await AppointmentService.cancelAppointment(
        oldAppointmentId,
        config.store.secrets?.calendly as unknown as AppointmentServiceConfig
      );
    }
    const noShowStatusTag = mapToMarketingSetStatusTagEvent({
      patientId,
      tag: "No Show",
      add: false,
    });
    const cancelledStatusTag = mapToMarketingSetStatusTagEvent({
      patientId,
      tag: "Cancelled",
      add: false,
    });

    await publishEvent(
      JSON.stringify(noShowStatusTag.payload),
      noShowStatusTag.eventType
    );
    await publishEvent(
      JSON.stringify(cancelledStatusTag.payload),
      cancelledStatusTag.eventType
    );
  } else {
    logInfo("First appointment appeared");

    const appointmentScheduledEvent = mapToAppointmentScheduledFbEvent({
      email: patient.id,
    }); // todo: pass email instead of ID
    await publishEvent(
      JSON.stringify(appointmentScheduledEvent.payload),
      appointmentScheduledEvent.eventType
    );
  }

  const timestamp = new Date().getTime();

  await DynamoDBService.appointments.create({
    patientId: `${appointment.payload.tracking.utm_source}`,
    appointmentId: appointment.payload.event.uuid,
    timestamp,
    startTime: appointment.payload.event.invitee_start_time,
    endTime: appointment.payload.event.invitee_end_time,
    status: "PENDING",
  });

  // TODO: implement code below
  // const careCoordinator = await DynamoDBService.careCoordinators.get(
  //   updatedPatient.care_coordinator_id as string
  // );
  // await Notify.Email.Patient.appointmentBooked(updatedPatient);
  // await Notify.SMS.CareCoordinator.newAppointment(
  //   careCoordinator,
  //   updatedPatient
  // );
});
