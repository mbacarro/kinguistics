import React, { useState, useEffect } from "react";
import { db } from "../../firebase.js";
import { ref, get, update } from "firebase/database";

export default function Register(props) {
    const email = props.email;
    const emailKey = email.replace('.', ',');
    const eventName = props.eventName;
    const eventData = props.eventData;
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
      const checkRegistration = async () => {
          const userEventsRef = ref(db, `Users/${emailKey}/Events/${eventName}`);
          const snapshot = await get(userEventsRef);
          setIsRegistered(snapshot.exists());
      };

      checkRegistration();
    }, [emailKey, eventName]);

    const handleButtonClick = async () => {
        try {
            const eventRef = ref(db, `Events/${eventName}`);
            const userEventsRef = ref(db, `Users/${emailKey}/Events`);
            const eventAttendeesRef = ref(db, `Events/${eventName}/Attendees`);
            if (isRegistered) {
                await update(userEventsRef, { [eventName]: null });
                await update(eventAttendeesRef, { [emailKey]: null });
                await update(eventRef, { "Current Attendees" : eventData["Current Attendees"] - 1 });
            } else {
                await update(userEventsRef, { [eventName]: true });
                await update(eventAttendeesRef, { [emailKey]: true });
                await update(eventRef, { "Current Attendees" : eventData["Current Attendees"] + 1 });
            }

            setIsRegistered(!isRegistered);

            props.onClose();
        } catch (error) {
            console.error("Error occurred during database operation:", error);
        }
    };
    
    return (
      <button
          onClick={handleButtonClick}
          className={`px-4 py-2 mx-4 text-white rounded ${
              props.registerDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-neutral-800 rounded-lg'
          }`}
          disabled={props.registerDisabled}
      >
          {isRegistered ? 'Unregister' : 'Register'}
      </button>
    );
}