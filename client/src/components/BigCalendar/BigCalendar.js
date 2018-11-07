import React, { Component } from "react";
import Calendar from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import API from "../../utils/API";
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Icon from '@material-ui/core/Icon';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { auth } from '../../firebase';
import { initGoogleCalendar, getCalendarEvents, createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from '../../session/googleCalendar'

// import "./App.css"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = Calendar.momentLocalizer(moment)

const DnDCalendar = withDragAndDrop(Calendar)

class BigCalendar extends Component {

    componentDidMount() {

        initGoogleCalendar()
            .then(calendarId => {

                this.setState({ calendarId })
                getCalendarEvents(calendarId, new Date(), new Date(moment().add(30, 'days')))
                    .then(res => {
                        if (res.status === 200) {
                            // Update the state with the retrieved calendar events
                            const eventArray = res.result.items.map(date => ({
                                id: date.id,
                                start: date.start.dateTime,
                                end: date.end.dateTime,
                                title: date.summary,
                                isAllDay: false
                            }))
                            console.log(eventArray)
                            this.setState({ events: eventArray }, () => console.log(this.state))


                            // createCalendarEvent(this.state.calendarId, "Job Piper IO", "test event", new Date(moment().subtract(2, 'days')), new Date(moment().add(1, 'days')))
                            //     .then(res => {
                            //         if (res.status === 200) {
                            //             // Update state with the event that was sucessfully created
                            //             let calendarEvents = this.state.googleCalEvents;
                            //             (res.result && calendarEvents.push(res.result));
                            //             this.setState({ googleCalEvents: calendarEvents })


                            // Delete the calendar event at index 0
                            // deleteCalendarEvent(this.state.calendarId,this.state.googleCalEvents[0].id)
                            // .then(res => {
                            //     if(res.status === 204) {
                            //         // The first arg of splice is the index of the event you want to remove
                            //         this.setState({googleCalEvents: this.state.googleCalEvents.splice(0, 1)})
                            //     }
                            // })
                            //         }
                            //     })
                        }
                    })
            })
    }

    state = {
        events: [],
        start: moment(Date.now()).format("YYYY-MM-DDTHH:mm:ssZ"),
        end: moment(Date.now()).format("YYYY-MM-DDTHH:mm:ssZ"),
        title: '',
        isAllDay: true,
        eventId: '',
        open: false
    }

    handleCreateEvent = () => {
        const { start, end, title, eventId } = this.state
        const updateEvent = { start: start, end: end, title: title, eventId: eventId }
        console.log(this.state.updateEvent)
        this.setState({ open: true })
    }
    onEventResize = (event) => {
        const { start, end } = event;
        const { id, title } = event.event
        let updatedEvent = this.state.events.find(event => event.id === id)
        updatedEvent.start = moment(start).format("YYYY-MM-DDTHH:mm:ssZ");
        updatedEvent.end = moment(end).format("YYYY-MM-DDTHH:mm:ssZ");

        let newEvents = this.state.events.filter(event => event.id !== id);
        // add the unchanged characters to the updated character array
        newEvents.push(updatedEvent)
        this.setState({ ...this.state, events: newEvents, updateEvent: updatedEvent, open: true });
        //update the calendar event at index 0
        updateCalendarEvent(this.state.calendarId, id, title, "updated event", start, end)
            .then(res => {
                if (res.status === 200) {

                    let calEvents = this.state.googleCalEvents
                    calEvents = res.result
                    this.setState({ googleCalEvents: calEvents })
                }
            })
    };

    onEventDrop = ({ event, id, start, end, isAllDay }) => {
        console.log("id is : ", event.id, start, end, isAllDay);
    };
    onDoubleClickEvent = (event) => {
        console.log(this.state)
        this.setState({ open: true })

    }
    handleClickOpen = () => {
        this.setState({ open: true });
        console.log('All Day: ', this.state.updateEvent.isAllDay);
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    handleSave = (event) => {
        const { title, start, end, eventId } = this.state.updateEvent;
        this.setState({
            open: false,
        });
        console.log(this.state.updateEvent)
        // console.log(`title ${title}, start ${start}, end ${end}`)
        // if (eventId !== '' || undefined) {
        //     updateCalendarEvent(this.state.calendarId, eventId, title, "updated event", start, end)
        //         .then(res => {
        //             if (res.status === 200) {

        //                 let calEvents = this.state.googleCalEvents
        //                 calEvents = res.result
        //                 this.setState({ events: calEvents })
        //             }
        //         })
        //         .catch(err => console.log(err))
        // } else {
        //     createCalendarEvent(this.state.calendarId, title, "created event", start, end)
        //         .then(res => {
        //             if (res.status === 200) {
        //                 // Update state with the event that was sucessfully created
        //                 let calendarEvents = this.state.googleCalEvents;
        //                 (res.result && calendarEvents.push(res.result));
        //                 this.setState({ events: calendarEvents })
        //             };
        //         })
        //         .catch(err => console.log(err))
        // }
        // reset updateEvent
        // updateEvent: {
        //     start: moment(Date.now()).format("YYYY-MM-DDTHH:mm:ssZ"),
        //     end: moment(Date.now()).format("YYYY-MM-DDTHH:mm:ssZ"),
        //     title: '',
        //     isAllDay: true,
        //     eventId: ''
        // }

    }
    handleisAllDay = name => event => {
        let updateEvent = { ...this.state.updateEvent }
        updateEvent.isAllDay = event.target.checked
        this.setState({ updateEvent });
    };
    handleEventChange = event => {
        const eventChange = Object.assign({}, this.state.updateEvent, {
            title: event.target.value
        })

        this.setState({ eventChange });
    };

    // const salary = Object.assign({}, this.state.salary, { min: minValue });

    // this.setState({ salary });

    render() {
        const { isAllDay, title, start, end, eventId } = this.state.updateEvent;
        return (
            <div>
                <DnDCalendar
                    localizer={localizer}
                    selectable="ignoreEvents"
                    defaultDate={new Date()}
                    defaultView="month"
                    events={this.state.events}
                    onEventDrop={this.onEventDrop}
                    onEventResize={this.onEventResize}
                    onDoubleClickEvent={this.onDoubleClickEvent}
                    resizable
                    popup
                    style={{ height: "90vh" }}
                />
                <Button variant="fab" color="primary" aria-label="Add"  >
                    <AddIcon onClick={this.handleCreateEvent} />
                </Button>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Event Details</DialogTitle>
                    <DialogContent>
                        {/* Title and all-day flag */}
                        <FormGroup row>
                            <TextField
                                id="title"
                                label="Event Title"
                                margin="normal"
                                value={title}
                                onChange={this.handleEventChange}
                            />
                            {/* <FormControlLabel control={
                                <Checkbox
                                    checked={isAllDay}
                                    onChange={this.handleEventChange('isAllDay')}
                                    color="primary"
                                    value="isAllDay"
                                />
                            }
                                label="All-Day Event" /> */}
                        </FormGroup>
                        {/* Start Date */}
                        <FormGroup row>
                            <TextField
                                id="startDate"
                                label="Start Date"
                                type="datetime-local"
                                defaultValue={(start ? moment(start).format("YYYY-MM-DDThh:mm") : moment(Date.now()).format("YYYY-MM-DDThh:mm"))}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </FormGroup>
                        {/* End Date */}
                        <FormGroup row>
                            <TextField
                                id="endDate"
                                label="End Date"
                                type="datetime-local"
                                defaultValue={(end ? moment(end).format("YYYY-MM-DDThh:mm") : moment(Date.now()).format("YYYY-MM-DDThh:mm"))}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </FormGroup>

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
            </Button>
                        <Button onClick={this.handleSave} color="primary">
                            Save
            </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default BigCalendar;