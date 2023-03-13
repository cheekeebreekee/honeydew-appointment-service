import { getByPatientId } from "./get-by-patient-id";
import { setAppointmentStatus } from "./set-appointment-status";
import { create } from "./create";
import { get } from "./get";
import { remove } from "./delete";

export const appointments = {
  getByPatientId,
  setAppointmentStatus,
  get,
  create,
  remove,
};
