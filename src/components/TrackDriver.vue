<template>
  <div class="hidden"></div>
</template>

<script>
import { firebaseDb, firebaseCollectionEnum } from "src/boot/FirebaseChat";
import APIinterface from "src/api/APIinterface";
import {
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";

export default {
  name: "TrackDriver",
  data() {
    return {
      driver_uuid: null,
      lastSentPosition: null,
      newPosition: null,
      threshold_meters: 50,
    };
  },
  watch: {
    driver_uuid(newval, oldval) {
      this.getFirebaseData();
    },
  },
  methods: {
    getFirebaseData() {
      const chatDocRef = doc(
        firebaseDb,
        firebaseCollectionEnum.drivers,
        this.driver_uuid
      );

      const SnapData = onSnapshot(
        chatDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            let results = docSnapshot.data();
            //console.log("results", results);
            const { lng, lat } = results;
            this.newPosition = { lng, lat };

            if (
              !this.lastSentPosition ||
              this.isSignificantChange(
                this.newPosition,
                this.lastSentPosition,
                this.threshold_meters
              )
            ) {
              console.log("update location");
              this.lastSentPosition = { lng, lat };
              this.$emit("setDriverlocation", results);
            } else {
              console.log("same location");
            }
          }
        },
        (error) => {
          console.error("Error fetching chat document:", error);
        }
      );
    },
    isSignificantChange(newStart, oldStart, threshold = 50) {
      const distance = this.getDistance(
        newStart.lat,
        newStart.lng,
        oldStart.lat,
        oldStart.lng
      );
      console.log("distance", distance);
      return distance > threshold; // If the distance is greater than the threshold (e.g., 50 meters)
    },
    getDistance(lat1, lng1, lat2, lng2) {
      const R = 6371e3; // Radius of the Earth in meters
      const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lng2 - lng1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const d = R * c; // in meters
      return d;
    },
    //
  },
};
</script>
