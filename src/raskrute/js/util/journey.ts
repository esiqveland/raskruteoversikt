import moment from 'moment';

export const JourneyDateTimePattern = 'DDMMYYYYHHmmss';

export interface StopIn {
    ArrivalTime: string
    DepartureTime: string
}

export interface Stop {
    Name: string
    ArrivalTime: moment.Moment
    DepartureTime: moment.Moment
}
