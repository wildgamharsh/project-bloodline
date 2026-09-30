/* Project Bloodline — js/data.js | Shared constants & seed data (single source of truth). */
const GROUPS = ["O−","O+","A−","A+","B−","B+","AB−","AB+"];
const COMPAT = {
  "O−":  { donateTo: GROUPS.slice(), receiveFrom: ["O−"] },
  "O+":  { donateTo: ["O+","A+","B+","AB+"], receiveFrom: ["O−","O+"] },
  "A−":  { donateTo: ["A−","A+","AB−","AB+"], receiveFrom: ["O−","A−"] },
  "A+":  { donateTo: ["A+","AB+"], receiveFrom: ["O−","O+","A−","A+"] },
  "B−":  { donateTo: ["B−","B+","AB−","AB+"], receiveFrom: ["O−","B−"] },
  "B+":  { donateTo: ["B+","AB+"], receiveFrom: ["O−","O+","B−","B+"] },
  "AB−": { donateTo: ["AB−","AB+"], receiveFrom: ["O−","A−","B−","AB−"] },
  "AB+": { donateTo: ["AB+"], receiveFrom: GROUPS.slice() }
};
const BADGE = { "O−":"g-on","O+":"g-op","A−":"g-an","A+":"g-ap","B−":"g-bn","B+":"g-bp","AB−":"g-abn","AB+":"g-abp" };
/* Bump this whenever seed data changes — store.js uses it to migrate stale (non-Indian) localStorage. */
const SEED_VERSION = 2;
const seedDonors = [
  { id: 1, name: "Aarav Sharma", group: "O−", city: "Ludhiana", area: "Model Town", phone: "+91 98140 23456", age: 24, gender: "Male", availability: "Available", lastDonation: "2026-05-18", donations: 6 },
  { id: 2, name: "Priya Kaur", group: "B+", city: "Amritsar", area: "Ranjit Avenue", phone: "+91 98765 12340", age: 29, gender: "Female", availability: "Available", lastDonation: "2026-06-02", donations: 4 },
  { id: 3, name: "Rohan Mehta", group: "A+", city: "Jalandhar", area: "Civil Lines", phone: "+91 98155 67890", age: 31, gender: "Male", availability: "Available", lastDonation: "2026-04-11", donations: 8 },
  { id: 4, name: "Simran Kaur Gill", group: "O+", city: "Ludhiana", area: "Sarabha Nagar", phone: "+91 98720 44556", age: 26, gender: "Female", availability: "Available", lastDonation: "2026-07-20", donations: 3 },
  { id: 5, name: "Arjun Patel", group: "AB+", city: "New Delhi", area: "Karol Bagh", phone: "+91 98110 22334", age: 34, gender: "Male", availability: "Available", lastDonation: "2026-03-05", donations: 10 },
  { id: 6, name: "Neha Verma", group: "A−", city: "Mumbai", area: "Andheri West", phone: "+91 98200 55667", age: 27, gender: "Female", availability: "Busy until Oct", lastDonation: "2026-07-01", donations: 5 },
  { id: 7, name: "Vikram Singh Rathore", group: "B−", city: "Jaipur", area: "Malviya Nagar", phone: "+91 98290 11223", age: 32, gender: "Male", availability: "Available", lastDonation: "2026-02-14", donations: 7 },
  { id: 8, name: "Ananya Iyer", group: "AB−", city: "Bengaluru", area: "Koramangala", phone: "+91 98860 33445", age: 25, gender: "Female", availability: "Available", lastDonation: "2026-06-28", donations: 2 },
  { id: 9, name: "Kabir Malhotra", group: "O−", city: "New Delhi", area: "Rohini Sector 7", phone: "+91 98188 99001", age: 28, gender: "Male", availability: "Available", lastDonation: "2026-05-30", donations: 9 },
  { id: 10, name: "Ishita Kapoor", group: "B+", city: "Ludhiana", area: "Civil Lines", phone: "+91 98726 77889", age: 23, gender: "Female", availability: "Available", lastDonation: "2026-08-09", donations: 1 },
  { id: 11, name: "Manpreet Singh", group: "O+", city: "Bathinda", area: "Model Town Phase 2", phone: "+91 98728 33441", age: 35, gender: "Male", availability: "Available", lastDonation: "2026-04-22", donations: 12 },
  { id: 12, name: "Divya Nair", group: "A+", city: "Kochi", area: "Kakkanad", phone: "+91 98470 22110", age: 30, gender: "Female", availability: "Available", lastDonation: "2026-06-15", donations: 4 },
  { id: 13, name: "Aditya Deshmukh", group: "B+", city: "Pune", area: "Baner", phone: "+91 98500 66778", age: 27, gender: "Male", availability: "Available", lastDonation: "2026-05-02", donations: 5 },
  { id: 14, name: "Gurleen Kaur", group: "O−", city: "Patiala", area: "Urban Estate", phone: "+91 98764 00912", age: 22, gender: "Female", availability: "Available", lastDonation: "2026-07-25", donations: 2 },
  { id: 15, name: "Rahul Yadav", group: "AB+", city: "Lucknow", area: "Gomti Nagar", phone: "+91 98390 44556", age: 33, gender: "Male", availability: "Busy until Oct", lastDonation: "2026-07-12", donations: 6 },
  { id: 16, name: "Sneha Reddy", group: "O+", city: "Hyderabad", area: "Kukatpally", phone: "+91 98480 11223", age: 26, gender: "Female", availability: "Available", lastDonation: "2026-06-20", donations: 3 },
  { id: 17, name: "Karan Ahuja", group: "A−", city: "Chandigarh", area: "Sector 34", phone: "+91 98765 88990", age: 29, gender: "Male", availability: "Available", lastDonation: "2026-03-28", donations: 7 },
  { id: 18, name: "Tanvi Joshi", group: "B−", city: "Ahmedabad", area: "Satellite", phone: "+91 98980 33445", age: 24, gender: "Female", availability: "Available", lastDonation: "2026-05-11", donations: 3 }
];
const seedEmerg = [
  { id: 1, group: "O−", location: "Ludhiana · DMC Hospital, Tagore Nagar", status: "Critical", info: "Trauma patient, surgery in 2 hours. Three units of O− red cells requested." },
  { id: 2, group: "B−", location: "Amritsar · Fortis Escorts, Ranjit Avenue", status: "Urgent", info: "Scheduled cardiac case tomorrow morning. One unit B− preferred; compatible alternatives listed in the matrix." }
];
