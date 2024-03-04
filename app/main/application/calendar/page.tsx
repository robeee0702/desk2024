"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { Draggable, DropArg } from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { HiMiniExclamationTriangle } from "react-icons/hi2";
import { AiFillCheckCircle } from "react-icons/ai";
import { EventSourceInput } from "@fullcalendar/core/index.js";
import { useClerk } from "@clerk/nextjs";
import { get, ref, remove, set } from "firebase/database";
import { database } from "@/firebase";

interface Event {
  title: string;
  start: Date | string;
  allDay: boolean;
  id: number;
}
interface NormalEvent {
  title: string;
  id: number;
}

// Az event szerkeszthető legyen.
// a színeket kellőképpen átalakítani.
// Mobilnézet specifikus legyen.
//Fontos valami

export default function Home() {
  const { user } = useClerk();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState<Event>({
    title: "",
    start: "",
    allDay: false,
    id: 0,
  });

  function handleDateClick(arg: { date: Date; allDay: boolean }) {
    setNewEvent({ ...newEvent, start: arg.date, allDay: arg.allDay, id: new Date().getTime() });
    setShowModal(true);
  }

  async function addEvent(data: DropArg) {
    const event = {
      ...newEvent,
      start: data.date.toISOString(),
      title: data.draggedEl.innerText,
      allDay: data.allDay,
      id: new Date().getTime(),
    };
  }

  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const [eventTitle, setEventTitle] = useState<string>("");

  function handleDeleteModal(data: { event: { id: string; title: string } }) {
    setShowDeleteModal(true);
    setIdToDelete(Number(data.event.id));
    setEventTitle(data.event.title);
  }

  function handleDelete() {
    const userRef = ref(database, `/users/data/${user.id}/calendar/allEvents/${idToDelete}`);
    remove(userRef)
      .then(() => {
        fetchEvents();
        console.log("Esemény sikeresen törölve az adatbázisból.");
      })
      .catch((error) => {
        console.error("Hiba az esemény törlése közben: ", error);
      });

    // Törölni az állapotból
    setAllEvents(allEvents.filter((event) => Number(event.id) !== Number(idToDelete)));
    setShowDeleteModal(false);
    setIdToDelete(null);
  }

  function handleCloseModal() {
    setShowModal(false);
    setShowEditEventModal(false);
    setNewEvent({
      title: "",
      start: "",
      allDay: false,
      id: 0,
    });
    setShowDeleteModal(false);
    setIdToDelete(null);
    setEventTitle("");
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewEvent({
      ...newEvent,
      title: e.target.value,
    });
  };

  const fetchEvents = async () => {
    if (user && user.id) {
      const eventsRef = ref(database, `/users/data/${user.id}/calendar/allEvents/`);
      const eventsSnapshot = await get(eventsRef);

      const firebaseEvents = eventsSnapshot.val();

      // Ha van adat az adatbázisban
      if (firebaseEvents !== null) {
        // Firebase-ból kapott objektumot átalakítjuk és rendezzük dátum szerint
        const myEvents = Object.values(firebaseEvents).map((event: any) => ({
          ...event,
          start: typeof event.start === "string" ? new Date(event.start) : event.start,
        }));

        // Szűrd az eseményeket a keresési kulcsszó alapján
        const filteredEvents = myEvents.filter((event) => event.title.toLowerCase().includes(searchKeyword.toLowerCase()));

        // Rendezd a szűrt eseményeket dátum szerint
        filteredEvents.sort((a: any, b: any) => a.start - b.start);

        // Állapot beállítása a rendezett és szűrt eseményekkel
        setAllEvents(filteredEvents);
      }
    }
  };

  // //Calendar events

  // const fetchEvents = async () => {
  //   if (user && user.id) {
  //     const eventsRef = ref(database, `/users/data/${user.id}/calendar/allEvents/`);
  //     const eventsSnapshot = await get(eventsRef);

  //     const firebaseEvents = eventsSnapshot.val();

  //     // Ha van adat az adatbázisban
  //     if (firebaseEvents !== null) {
  //       // Firebase-ból kapott objektumot átalakítjuk és rendezzük dátum szerint
  //       const myEvents = Object.values(firebaseEvents).map((event: any) => ({
  //         ...event,
  //         start: typeof event.start === "string" ? new Date(event.start) : event.start,
  //       }));

  //       // Rendezzük a tömböt dátum szerint
  //       myEvents.sort((a: any, b: any) => a.start - b.start);

  //       // Állapot beállítása a rendezett eseményekkel
  //       setAllEvents(myEvents);
  //     }
  //   }
  // };

  //Calendar events

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const event = {
      ...newEvent,
      start: newEvent.start.toString(), // Változtasd meg a start formátumát, ha szükséges
      id: new Date().getTime().toString(), // A generált id mostantól string típusú
    };

    const userRef = ref(database, `/users/data/${user.id}/calendar/allEvents/${event.id}`);
    try {
      await set(userRef, event);

      // Fetch eseményeket újra a frissített adatokkal
      fetchEvents();

      setNewEvent({
        title: "",
        start: "",
        allDay: false,
        id: 0,
      });

      setShowModal(false);

      console.log("Esemény sikeresen hozzáadva");
    } catch (error) {
      console.error("Hiba az esemény hozzáadása közben: ", error);
    }
  };

  //Calendar events
  useEffect(() => {
    if (user && user.id) {
      fetchEvents();
    }
  }, [user, searchKeyword]);

  console.log(searchKeyword);
  console.log("Kimenet:", allEvents);

  return (
    <>
      <div className="text-black w-full flex flex-col relative overflow-hidden">
        <div className="m-6 mt-16 md:m-12 xl:m-20 h-full overflow-hidden">
          {/* Naptár */}
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, multiMonthPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "timeGridDay,timeGridWeek,dayGridMonth,multiMonthYear",
            }}
            events={allEvents as EventSourceInput}
            height={968}
            eventDisplay="block"
            nowIndicator={true}
            editable={true}
            droppable={true}
            selectable={true}
            selectMirror={true}
            dateClick={handleDateClick}
            drop={(data) => addEvent(data)}
            eventClick={(data) => handleDeleteModal(data)}
          />
        </div>
        <input type="text" className="absolute m-2 p-2 border border-darkgrey rounded-lg top-0 right-0" placeholder="Search events..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />

        <Transition.Root show={showDeleteModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowDeleteModal}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                  <Dialog.Panel
                    className="relative transform overflow-hidden rounded-lg
                    bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div
                          className="mx-auto flex h-12 w-12 flex-shrink-0 items-center 
                          justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <HiMiniExclamationTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                            Delete Event
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">Event: {eventTitle}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                         type="button"
                         className="mt-3 inline-flex w-full justify-center rounded-md bg-red px-3 py-2 text-sm 
                         font-semibold text-black56 shadow-sm ring-1 ring-inset ring-grey hover:bg-opacity-70 sm:col-start-1 sm:mt-0"
                        onClick={handleDelete}>
                        Delete
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm 
                        font-semibold text-black56 shadow-sm ring-1 ring-inset ring-grey hover:bg-darkgrey sm:col-start-1 sm:mt-0"
                        onClick={handleCloseModal}>
                        Cancel
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        <Transition.Root show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowModal}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <AiFillCheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          Add Event
                        </Dialog.Title>
                        <form action="submit" onSubmit={handleSubmit}>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="title"
                              className="block w-full rounded-md border-0 px-2 py-1.5 text-black
                              shadow-sm ring-1 ring-inset ring-black72 placeholder:text-gray-400 
                              focus:ring-2 
                              focus:ring-inset focus:ring-black
                              sm:text-sm sm:leading-6"
                              value={newEvent.title}
                              onChange={(e) => handleChange(e)}
                              placeholder="Title"
                            />
                          </div>
                          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                            <button
                              type="submit"
                              className="inline-flex w-full justify-center text-blue rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 sm:col-start-2 disabled:opacity-25"
                              disabled={newEvent.title === ""}>
                              Create
                            </button>
                            <button
                              type="button"
                              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-black56 shadow-sm ring-1 ring-inset ring-grey hover:bg-darkgrey sm:col-start-1 sm:mt-0"
                              onClick={handleCloseModal}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
    </>
  );
}
