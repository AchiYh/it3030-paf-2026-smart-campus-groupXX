import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/member2/bookingService';
import BookingCard from '../../components/member2/BookingCard';
import BookingModal from '../../components/member2/BookingModal';
import EditBookingModal from '../../components/member2/EditBookingModal';
import './MyBookings.css';

// ==================== EXPANDED RESOURCE DATA ====================

const RESOURCES_DATA = {
  // Lecture Halls (including Engineering Block & New Building)
  lectureHalls: [
    // Main Building
    { id: 'lh1', name: 'Lecture Hall A', roomNumber: 'A101', type: 'Lecture Halls', location: 'Main Building', capacity: 2500, status: 'ACTIVE' },
    { id: 'lh2', name: 'Lecture Hall B', roomNumber: 'A102', type: 'Lecture Halls', location: 'Main Building', capacity: 2000, status: 'ACTIVE' },
    { id: 'lh3', name: 'Lecture Hall C', roomNumber: 'A103', type: 'Lecture Halls', location: 'Main Building', capacity: 1800, status: 'OUT_OF_SERVICE' },
    { id: 'lh4', name: 'Lecture Hall D', roomNumber: 'A104', type: 'Lecture Halls', location: 'Main Building', capacity: 1600, status: 'ACTIVE' },
    // Science Block
    { id: 'lh5', name: 'Lecture Hall E', roomNumber: 'S201', type: 'Lecture Halls', location: 'Science Block', capacity: 1500, status: 'ACTIVE' },
    { id: 'lh6', name: 'Lecture Hall F', roomNumber: 'S202', type: 'Lecture Halls', location: 'Science Block', capacity: 1400, status: 'ACTIVE' },
    { id: 'lh7', name: 'Lecture Hall G', roomNumber: 'S203', type: 'Lecture Halls', location: 'Science Block', capacity: 1300, status: 'OUT_OF_SERVICE' },
    // Engineering Block
    { id: 'lh8', name: 'Engineering Hall 1', roomNumber: 'E101', type: 'Lecture Halls', location: 'Engineering Block', capacity: 1200, status: 'ACTIVE' },
    { id: 'lh9', name: 'Engineering Hall 2', roomNumber: 'E102', type: 'Lecture Halls', location: 'Engineering Block', capacity: 1100, status: 'ACTIVE' },
    { id: 'lh10', name: 'Engineering Hall 3', roomNumber: 'E103', type: 'Lecture Halls', location: 'Engineering Block', capacity: 1000, status: 'ACTIVE' },
    { id: 'lh11', name: 'Engineering Hall 4', roomNumber: 'E104', type: 'Lecture Halls', location: 'Engineering Block', capacity: 900, status: 'ACTIVE' },
    { id: 'lh12', name: 'Engineering Hall 5', roomNumber: 'E105', type: 'Lecture Halls', location: 'Engineering Block', capacity: 800, status: 'ACTIVE' },
    { id: 'lh13', name: 'Engineering Hall 6', roomNumber: 'E106', type: 'Lecture Halls', location: 'Engineering Block', capacity: 700, status: 'OUT_OF_SERVICE' },
    { id: 'lh14', name: 'Engineering Hall 7', roomNumber: 'E107', type: 'Lecture Halls', location: 'Engineering Block', capacity: 600, status: 'OUT_OF_SERVICE' },
    // New Building
    { id: 'lh15', name: 'New Lecture Hall 1', roomNumber: 'N101', type: 'Lecture Halls', location: 'New Building', capacity: 2200, status: 'ACTIVE' },
    { id: 'lh16', name: 'New Lecture Hall 2', roomNumber: 'N102', type: 'Lecture Halls', location: 'New Building', capacity: 2100, status: 'ACTIVE' },
    { id: 'lh17', name: 'New Lecture Hall 3', roomNumber: 'N103', type: 'Lecture Halls', location: 'New Building', capacity: 1900, status: 'ACTIVE' },
    { id: 'lh18', name: 'New Lecture Hall 4', roomNumber: 'N104', type: 'Lecture Halls', location: 'New Building', capacity: 1800, status: 'ACTIVE' },
    { id: 'lh19', name: 'New Lecture Hall 5', roomNumber: 'N105', type: 'Lecture Halls', location: 'New Building', capacity: 1700, status: 'ACTIVE' },
    { id: 'lh20', name: 'New Lecture Hall 6', roomNumber: 'N106', type: 'Lecture Halls', location: 'New Building', capacity: 1600, status: 'OUT_OF_SERVICE' },
    { id: 'lh21', name: 'New Lecture Hall 7', roomNumber: 'N107', type: 'Lecture Halls', location: 'New Building', capacity: 1500, status: 'OUT_OF_SERVICE' },
  ],

  // Laboratories
  labs: [
    // Tech Wing
    { id: 'lab1', name: 'Computer Lab A', roomNumber: 'LAB01', type: 'Labs', location: 'Tech Wing', capacity: 150, status: 'ACTIVE' },
    { id: 'lab2', name: 'Computer Lab B', roomNumber: 'LAB02', type: 'Labs', location: 'Tech Wing', capacity: 180, status: 'ACTIVE' },
    { id: 'lab3', name: 'Computer Lab C', roomNumber: 'LAB03', type: 'Labs', location: 'Tech Wing', capacity: 200, status: 'ACTIVE' },
    { id: 'lab4', name: 'Networking Lab', roomNumber: 'LAB06', type: 'Labs', location: 'Tech Wing', capacity: 145, status: 'ACTIVE' },
    { id: 'lab5', name: 'Security Lab', roomNumber: 'LAB07', type: 'Labs', location: 'Tech Wing', capacity: 250, status: 'OUT_OF_SERVICE' },
    // Science Block
    { id: 'lab6', name: 'Electronics Lab', roomNumber: 'LAB04', type: 'Labs', location: 'Science Block', capacity: 200, status: 'ACTIVE' },
    { id: 'lab7', name: 'Physics Lab', roomNumber: 'LAB08', type: 'Labs', location: 'Science Block', capacity: 135, status: 'ACTIVE' },
    { id: 'lab8', name: 'Chemistry Lab', roomNumber: 'LAB09', type: 'Labs', location: 'Science Block', capacity: 130, status: 'ACTIVE' },
    { id: 'lab9', name: 'Biology Lab', roomNumber: 'LAB10', type: 'Labs', location: 'Science Block', capacity: 125, status: 'OUT_OF_SERVICE' },
    // Engineering Block
    { id: 'lab10', name: 'Robotics Lab', roomNumber: 'LAB05', type: 'Labs', location: 'Engineering Block', capacity: 230, status: 'ACTIVE' },
    { id: 'lab11', name: 'Mechanical Lab', roomNumber: 'LAB11', type: 'Labs', location: 'Engineering Block', capacity: 220, status: 'ACTIVE' },
    { id: 'lab12', name: 'Civil Lab', roomNumber: 'LAB12', type: 'Labs', location: 'Engineering Block', capacity: 150, status: 'OUT_OF_SERVICE' },
    // New Building
    { id: 'lab13', name: 'AI Lab', roomNumber: 'LAB13', type: 'Labs', location: 'New Building', capacity: 350, status: 'ACTIVE' },
    { id: 'lab14', name: 'Data Science Lab', roomNumber: 'LAB14', type: 'Labs', location: 'New Building', capacity: 600, status: 'ACTIVE' },
    { id: 'lab15', name: 'VR Lab', roomNumber: 'LAB15', type: 'Labs', location: 'New Building', capacity: 250, status: 'ACTIVE' },
    { id: 'lab16', name: 'IoT Lab', roomNumber: 'LAB16', type: 'Labs', location: 'New Building', capacity: 450, status: 'OUT_OF_SERVICE' },
    // Main Building
    { id: 'lab17', name: 'Main Computer Lab', roomNumber: 'MLAB01', type: 'Labs', location: 'Main Building', capacity: 270, status: 'ACTIVE' },
    { id: 'lab18', name: 'Main Electronics Lab', roomNumber: 'MLAB02', type: 'Labs', location: 'Main Building', capacity: 250, status: 'ACTIVE' },
    { id: 'lab19', name: 'Main Physics Lab', roomNumber: 'MLAB03', type: 'Labs', location: 'Main Building', capacity: 220, status: 'OUT_OF_SERVICE' },
  ],

  // Meeting Rooms
  meetingRooms: [
    // Main Building
    { id: 'mr1', name: 'Conference Room', roomNumber: 'CR201', type: 'Meeting Rooms', location: 'Main Building', capacity: 200, status: 'ACTIVE' },
    { id: 'mr2', name: 'Meeting Room 3', roomNumber: 'MR301', type: 'Meeting Rooms', location: 'Main Building', capacity: 120, status: 'ACTIVE' },
    { id: 'mr3', name: 'Executive Lounge', roomNumber: 'EL401', type: 'Meeting Rooms', location: 'Main Building', capacity: 100, status: 'OUT_OF_SERVICE' },
    // New Building
    { id: 'mr4', name: 'Seminar Room', roomNumber: 'NR101', type: 'Meeting Rooms', location: 'New Building', capacity: 250, status: 'ACTIVE' },
    { id: 'mr5', name: 'Huddle Room', roomNumber: 'NR102', type: 'Meeting Rooms', location: 'New Building', capacity: 80, status: 'ACTIVE' },
    { id: 'mr6', name: 'Innovation Hub', roomNumber: 'NR103', type: 'Meeting Rooms', location: 'New Building', capacity: 130, status: 'ACTIVE' },
    { id: 'mr7', name: 'New Boardroom', roomNumber: 'NR104', type: 'Meeting Rooms', location: 'New Building', capacity: 180, status: 'OUT_OF_SERVICE' },
    // Auditorium
    { id: 'mr8', name: 'Main Auditorium', roomNumber: 'AUD101', type: 'Meeting Rooms', location: 'Auditorium', capacity: 500, status: 'ACTIVE' },
    { id: 'mr9', name: 'Small Auditorium', roomNumber: 'AUD102', type: 'Meeting Rooms', location: 'Auditorium', capacity: 1200, status: 'ACTIVE' },
    { id: 'mr10', name: 'Rehearsal Hall', roomNumber: 'AUD103', type: 'Meeting Rooms', location: 'Auditorium', capacity: 1000, status: 'OUT_OF_SERVICE' },
    // Library
    { id: 'mr11', name: 'Discussion Pod', roomNumber: 'DP301', type: 'Meeting Rooms', location: 'Library', capacity: 50, status: 'ACTIVE' },
    { id: 'mr12', name: 'Study Group Room', roomNumber: 'SG401', type: 'Meeting Rooms', location: 'Library', capacity: 60, status: 'ACTIVE' },
    { id: 'mr13', name: 'Silent Study Hall', roomNumber: 'SS501', type: 'Meeting Rooms', location: 'Library', capacity: 120, status: 'ACTIVE' },
    { id: 'mr14', name: 'Research Room', roomNumber: 'RR601', type: 'Meeting Rooms', location: 'Library', capacity: 30, status: 'OUT_OF_SERVICE' },
    // Media Center
    { id: 'mr15', name: 'Media Studio', roomNumber: 'MC101', type: 'Meeting Rooms', location: 'Media Center', capacity: 15, status: 'ACTIVE' },
    { id: 'mr16', name: 'Recording Room', roomNumber: 'MC102', type: 'Meeting Rooms', location: 'Media Center', capacity: 120, status: 'ACTIVE' },
    { id: 'mr17', name: 'Editing Suite', roomNumber: 'MC103', type: 'Meeting Rooms', location: 'Media Center', capacity: 50, status: 'OUT_OF_SERVICE' },
    // Admin Block
    { id: 'mr18', name: 'Board Room', roomNumber: 'BR401', type: 'Meeting Rooms', location: 'Admin Block', capacity: 15, status: 'ACTIVE' },
    { id: 'mr19', name: 'Meeting Room 1', roomNumber: 'MR101', type: 'Meeting Rooms', location: 'Admin Block', capacity: 30, status: 'ACTIVE' },
    { id: 'mr20', name: 'Meeting Room 2', roomNumber: 'MR102', type: 'Meeting Rooms', location: 'Admin Block', capacity: 40, status: 'ACTIVE' },
    { id: 'mr21', name: 'HR Conference', roomNumber: 'HR201', type: 'Meeting Rooms', location: 'Admin Block', capacity: 120, status: 'OUT_OF_SERVICE' },
  ],

  // Equipment
  equipment: [
    { id: 'eq1', name: 'Projector', type: 'Equipment', location: 'Media Center', totalCount: 20, availableCount: 12, status: 'ACTIVE' },
    { id: 'eq2', name: 'Camera Kit', type: 'Equipment', location: 'Media Center', totalCount: 25, availableCount: 13, status: 'ACTIVE' },
    { id: 'eq3', name: 'Laptop Set', type: 'Equipment', location: 'Tech Wing', totalCount: 100, availableCount: 60, status: 'ACTIVE' },
    { id: 'eq4', name: 'Sound System', type: 'Equipment', location: 'Auditorium', totalCount: 50, availableCount: 22, status: 'ACTIVE' },
    { id: 'eq5', name: 'Wireless Mic', type: 'Equipment', location: 'Media Center', totalCount: 25, availableCount: 12, status: 'ACTIVE' },
    { id: 'eq6', name: 'Tripod', type: 'Equipment', location: 'Media Center', totalCount: 15, availableCount: 10, status: 'OUT_OF_SERVICE' },
    { id: 'eq7', name: 'Whiteboard', type: 'Equipment', location: 'Main Building', totalCount: 20, availableCount: 15, status: 'ACTIVE' },
    { id: 'eq8', name: 'Clicker/Presenter', type: 'Equipment', location: 'Tech Wing', totalCount: 30, availableCount: 20, status: 'ACTIVE' },
    { id: 'eq9', name: 'Document Camera', type: 'Equipment', location: 'Science Block', totalCount: 25, availableCount: 5, status: 'ACTIVE' },
    { id: 'eq10', name: 'Portable Screen', type: 'Equipment', location: 'Media Center', totalCount: 20, availableCount: 12, status: 'ACTIVE' },
    { id: 'eq11', name: 'Conference Speaker', type: 'Equipment', location: 'Admin Block', totalCount: 10, availableCount: 4, status: 'OUT_OF_SERVICE' },
    { id: 'eq12', name: 'Webcam Kit', type: 'Equipment', location: 'Library', totalCount: 15, availableCount: 10, status: 'ACTIVE' },
    { id: 'eq13', name: 'Green Screen', type: 'Equipment', location: 'Media Center', totalCount: 25, availableCount: 20, status: 'ACTIVE' },
    { id: 'eq14', name: 'Portable PA System', type: 'Equipment', location: 'Auditorium', totalCount: 3, availableCount: 0, status: 'ACTIVE' },
  ]
};

// ==================== CATEGORY-SPECIFIC FILTER CONFIGURATIONS ====================

const CATEGORY_LOCATIONS = {
  'Lecture Halls': ['All Locations', 'Main Building', 'New Building', 'Science Block', 'Engineering Block'],
  'Labs': ['All Locations', 'Tech Wing', 'Science Block', 'Engineering Block', 'New Building', 'Main Building'],
  'Meeting Rooms': ['All Locations', 'Main Building', 'New Building', 'Auditorium', 'Library', 'Media Center', 'Admin Block'],
  'Equipment': [],
  'All': []
};

const CATEGORY_ROOM_MAPPING = {
  'Lecture Halls': {
    'Main Building': [
      { id: 'room_a101', name: 'A101 - Lecture Hall A', capacity: 2500, resourceId: 'lh1' },
      { id: 'room_a102', name: 'A102 - Lecture Hall B', capacity: 2000, resourceId: 'lh2' },
      { id: 'room_a103', name: 'A103 - Lecture Hall C', capacity: 1800, resourceId: 'lh3' },
      { id: 'room_a104', name: 'A104 - Lecture Hall D', capacity: 1600, resourceId: 'lh4' },
    ],
    'New Building': [
      { id: 'room_n101', name: 'N101 - New Lecture Hall 1', capacity: 2200, resourceId: 'lh15' },
      { id: 'room_n102', name: 'N102 - New Lecture Hall 2', capacity: 2100, resourceId: 'lh16' },
      { id: 'room_n103', name: 'N103 - New Lecture Hall 3', capacity: 1900, resourceId: 'lh17' },
      { id: 'room_n104', name: 'N104 - New Lecture Hall 4', capacity: 1800, resourceId: 'lh18' },
      { id: 'room_n105', name: 'N105 - New Lecture Hall 5', capacity: 1700, resourceId: 'lh19' },
      { id: 'room_n106', name: 'N106 - New Lecture Hall 6', capacity: 1600, resourceId: 'lh20' },
      { id: 'room_n107', name: 'N107 - New Lecture Hall 7', capacity: 1500, resourceId: 'lh21' },
    ],
    'Science Block': [
      { id: 'room_s201', name: 'S201 - Lecture Hall E', capacity: 1500, resourceId: 'lh5' },
      { id: 'room_s202', name: 'S202 - Lecture Hall F', capacity: 1400, resourceId: 'lh6' },
      { id: 'room_s203', name: 'S203 - Lecture Hall G', capacity: 1300, resourceId: 'lh7' },
    ],
    'Engineering Block': [
      { id: 'room_e101', name: 'E101 - Engineering Hall 1', capacity: 1200, resourceId: 'lh8' },
      { id: 'room_e102', name: 'E102 - Engineering Hall 2', capacity: 1100, resourceId: 'lh9' },
      { id: 'room_e103', name: 'E103 - Engineering Hall 3', capacity: 1000, resourceId: 'lh10' },
      { id: 'room_e104', name: 'E104 - Engineering Hall 4', capacity: 900, resourceId: 'lh11' },
      { id: 'room_e105', name: 'E105 - Engineering Hall 5', capacity: 800, resourceId: 'lh12' },
      { id: 'room_e106', name: 'E106 - Engineering Hall 6', capacity: 700, resourceId: 'lh13' },
      { id: 'room_e107', name: 'E107 - Engineering Hall 7', capacity: 600, resourceId: 'lh14' },
    ],
  },
  'Labs': {
    'Tech Wing': [
      { id: 'lab_lab01', name: 'LAB01 - Computer Lab A', capacity: 150, resourceId: 'lab1' },
      { id: 'lab_lab02', name: 'LAB02 - Computer Lab B', capacity: 180, resourceId: 'lab2' },
      { id: 'lab_lab03', name: 'LAB03 - Computer Lab C', capacity: 200, resourceId: 'lab3' },
      { id: 'lab_lab06', name: 'LAB06 - Networking Lab', capacity: 145, resourceId: 'lab4' },
      { id: 'lab_lab07', name: 'LAB07 - Security Lab', capacity: 250, resourceId: 'lab5' },
    ],
    'Science Block': [
      { id: 'lab_lab04', name: 'LAB04 - Electronics Lab', capacity: 200, resourceId: 'lab6' },
      { id: 'lab_lab08', name: 'LAB08 - Physics Lab', capacity: 135, resourceId: 'lab7' },
      { id: 'lab_lab09', name: 'LAB09 - Chemistry Lab', capacity: 130, resourceId: 'lab8' },
      { id: 'lab_lab10', name: 'LAB10 - Biology Lab', capacity: 125, resourceId: 'lab9' },
    ],
    'Engineering Block': [
      { id: 'lab_lab05', name: 'LAB05 - Robotics Lab', capacity: 230, resourceId: 'lab10' },
      { id: 'lab_lab11', name: 'LAB11 - Mechanical Lab', capacity: 220, resourceId: 'lab11' },
      { id: 'lab_lab12', name: 'LAB12 - Civil Lab', capacity: 150, resourceId: 'lab12' },
    ],
    'New Building': [
      { id: 'lab_lab13', name: 'LAB13 - AI Lab', capacity: 350, resourceId: 'lab13' },
      { id: 'lab_lab14', name: 'LAB14 - Data Science Lab', capacity: 600, resourceId: 'lab14' },
      { id: 'lab_lab15', name: 'LAB15 - VR Lab', capacity: 250, resourceId: 'lab15' },
      { id: 'lab_lab16', name: 'LAB16 - IoT Lab', capacity: 450, resourceId: 'lab16' },
    ],
    'Main Building': [
      { id: 'lab_mlab01', name: 'MLAB01 - Main Computer Lab', capacity: 270, resourceId: 'lab17' },
      { id: 'lab_mlab02', name: 'MLAB02 - Main Electronics Lab', capacity: 250, resourceId: 'lab18' },
      { id: 'lab_mlab03', name: 'MLAB03 - Main Physics Lab', capacity: 220, resourceId: 'lab19' },
    ],
  },
  'Meeting Rooms': {
    'Main Building': [
      { id: 'mr_cr201', name: 'CR201 - Conference Room', capacity: 200, resourceId: 'mr1' },
      { id: 'mr_mr301', name: 'MR301 - Meeting Room 3', capacity: 120, resourceId: 'mr2' },
      { id: 'mr_el401', name: 'EL401 - Executive Lounge', capacity: 100, resourceId: 'mr3' },
    ],
    'New Building': [
      { id: 'mr_nr101', name: 'NR101 - Seminar Room', capacity: 250, resourceId: 'mr4' },
      { id: 'mr_nr102', name: 'NR102 - Huddle Room', capacity: 80, resourceId: 'mr5' },
      { id: 'mr_nr103', name: 'NR103 - Innovation Hub', capacity: 130, resourceId: 'mr6' },
      { id: 'mr_nr104', name: 'NR104 - New Boardroom', capacity: 180, resourceId: 'mr7' },
    ],
    'Auditorium': [
      { id: 'mr_aud101', name: 'AUD101 - Main Auditorium', capacity: 500, resourceId: 'mr8' },
      { id: 'mr_aud102', name: 'AUD102 - Small Auditorium', capacity: 1200, resourceId: 'mr9' },
      { id: 'mr_aud103', name: 'AUD103 - Rehearsal Hall', capacity: 1000, resourceId: 'mr10' },
    ],
    'Library': [
      { id: 'mr_dp301', name: 'DP301 - Discussion Pod', capacity: 50, resourceId: 'mr11' },
      { id: 'mr_sg401', name: 'SG401 - Study Group Room', capacity: 60, resourceId: 'mr12' },
      { id: 'mr_ss501', name: 'SS501 - Silent Study Hall', capacity: 120, resourceId: 'mr13' },
      { id: 'mr_rr601', name: 'RR601 - Research Room', capacity: 30, resourceId: 'mr14' },
    ],
    'Media Center': [
      { id: 'mr_mc101', name: 'MC101 - Media Studio', capacity: 15, resourceId: 'mr15' },
      { id: 'mr_mc102', name: 'MC102 - Recording Room', capacity: 120, resourceId: 'mr16' },
      { id: 'mr_mc103', name: 'MC103 - Editing Suite', capacity: 50, resourceId: 'mr17' },
    ],
    'Admin Block': [
      { id: 'mr_br401', name: 'BR401 - Board Room', capacity: 15, resourceId: 'mr18' },
      { id: 'mr_mr101', name: 'MR101 - Meeting Room 1', capacity: 30, resourceId: 'mr19' },
      { id: 'mr_mr102', name: 'MR102 - Meeting Room 2', capacity: 40, resourceId: 'mr20' },
      { id: 'mr_hr201', name: 'HR201 - HR Conference', capacity: 120, resourceId: 'mr21' },
    ],
  },
  'Equipment': {},
  'All': {}
};

const EQUIPMENT_LIST = [
  { id: 'eq1', name: 'Projector', available: 20, total: 20 },
  { id: 'eq2', name: 'Camera Kit', available: 13, total: 25 },
  { id: 'eq3', name: 'Laptop Set', available: 60, total: 100 },
  { id: 'eq4', name: 'Sound System', available: 22, total: 50 },
  { id: 'eq5', name: 'Wireless Mic', available: 12, total: 25 },
  { id: 'eq6', name: 'Tripod', available: 10, total: 15 },
  { id: 'eq7', name: 'Whiteboard', available: 15, total: 20 },
  { id: 'eq8', name: 'Clicker/Presenter', available: 20, total: 30 },
  { id: 'eq9', name: 'Document Camera', available: 5, total: 25 },
  { id: 'eq10', name: 'Portable Screen', available: 12, total: 20 },
  { id: 'eq11', name: 'Conference Speaker', available: 4, total: 10 },
  { id: 'eq12', name: 'Webcam Kit', available: 10, total: 15 },
  { id: 'eq13', name: 'Green Screen', available: 20, total: 25 },
  { id: 'eq14', name: 'Portable PA System', available: 0, total: 3 },
];

const ALL_RESOURCES = [
  ...RESOURCES_DATA.lectureHalls,
  ...RESOURCES_DATA.labs,
  ...RESOURCES_DATA.meetingRooms,
  ...RESOURCES_DATA.equipment
];

// ==================== MAIN COMPONENT ====================

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState(ALL_RESOURCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    location: 'All Locations',
    selectedRoom: 'All',
    selectedEquipment: 'All',
    maxCapacity: ''
  });

  // Load bookings from backend
  useEffect(() => {
    if (!user?.email) return;
    loadBookings();
  }, [user]);

  // Re-apply filters whenever filters or showAvailableOnly change
  useEffect(() => {
    filterResources();
  }, [filters, showAvailableOnly]);

  // Auto-dismiss messages
  useEffect(() => {
    if (!successMessage && !error) return;
    const timer = setTimeout(() => {
      setSuccessMessage(null);
      setError(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [successMessage, error]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getMyBookings(user.email);
      setBookings(response.data || []);
    } catch (err) {
      setError('Unable to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  // Filter resources based on current filters and showAvailableOnly
  const filterResources = () => {
    let filtered = [...ALL_RESOURCES];
    
    if (filters.category !== 'All') {
      filtered = filtered.filter(r => r.type === filters.category);
    }
    
    if (filters.category === 'Equipment' && filters.selectedEquipment !== 'All') {
      filtered = filtered.filter(r => r.id === filters.selectedEquipment);
    }
    
    if (filters.category !== 'Equipment' && filters.category !== 'All') {
      if (filters.location !== 'All Locations') {
        filtered = filtered.filter(r => r.location === filters.location);
      }
      
      if (filters.selectedRoom !== 'All' && filters.location !== 'All Locations') {
        const roomInfo = CATEGORY_ROOM_MAPPING[filters.category]?.[filters.location]?.find(r => r.id === filters.selectedRoom);
        if (roomInfo && roomInfo.resourceId) {
          filtered = filtered.filter(r => r.id === roomInfo.resourceId);
        } else if (roomInfo && !roomInfo.resourceId) {
          filtered = [];
        }
      }
    }
    
    if (filters.maxCapacity && (filters.category === 'All' || filters.category === 'Equipment')) {
      filtered = filtered.filter(r => r.capacity <= parseInt(filters.maxCapacity));
    }
    
    if (filters.search) {
      filtered = filtered.filter(r => r.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    
    if (filters.category === 'Equipment' && showAvailableOnly) {
      filtered = filtered.filter(r => r.availableCount > 0);
    }
    
    setResources(filtered);
  };

  // Helper to update available count of an equipment resource locally
  const updateEquipmentCount = (equipmentId, delta) => {
    setResources(prevResources =>
      prevResources.map(r =>
        r.id === equipmentId && r.type === 'Equipment'
          ? { ...r, availableCount: Math.max(0, r.availableCount + delta) }
          : r
      )
    );
  };

  const handleCreate = async (bookingData) => {
    try {
      const response = await bookingService.createBooking(bookingData);
      setBookings((current) => [response.data, ...current]);
      setSuccessMessage('Booking request created successfully!');
      setShowBookingModal(false);

      // Update local equipment count (decrease by quantity)
      if (selectedResource?.type === 'Equipment') {
        const quantity = bookingData.quantity || 1;
        updateEquipmentCount(selectedResource.id, -quantity);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create booking.';
      throw new Error(message);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      const bookingToCancel = bookings.find(b => b.id === bookingId);
      await bookingService.cancelBooking(bookingId);
      await loadBookings();
      setSuccessMessage('Booking cancelled successfully.');

      // Restore equipment stock
      if (bookingToCancel?.resourceType === 'Equipment') {
        updateEquipmentCount(bookingToCancel.resourceId, bookingToCancel.quantity || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel booking.');
    }
  };

  const handleEditClick = (booking) => {
    const resource = ALL_RESOURCES.find(r => r.id === booking.resourceId);
    if (resource) {
      setEditingBooking({ ...booking, resourceDetails: resource });
    } else {
      setEditingBooking(booking);
    }
  };

  const handleUpdate = async (bookingId, updatedBookingData) => {
    try {
      const oldBooking = bookings.find(b => b.id === bookingId);
      const oldQuantity = oldBooking?.quantity || 1;
      const newQuantity = updatedBookingData.quantity || 1;

      await bookingService.updateBooking(bookingId, updatedBookingData);
      await loadBookings();
      setSuccessMessage('Booking updated successfully.');
      setEditingBooking(null);

      // Adjust equipment stock locally based on quantity change
      if (updatedBookingData.resourceType === 'Equipment') {
        const delta = oldQuantity - newQuantity; // positive if reduced quantity
        if (delta !== 0) {
          updateEquipmentCount(updatedBookingData.resourceId, delta);
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to update booking.';
      setError(message);
      throw new Error(message);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Delete this pending booking?')) return;
    try {
      const bookingToDelete = bookings.find(b => b.id === bookingId);
      await bookingService.deleteBooking(bookingId);
      await loadBookings();
      setSuccessMessage('Booking deleted successfully.');

      // Restore equipment stock
      if (bookingToDelete?.resourceType === 'Equipment') {
        updateEquipmentCount(bookingToDelete.resourceId, bookingToDelete.quantity || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete booking.');
    }
  };

  const handleBookNow = (resource) => {
    setSelectedResource(resource);
    setShowBookingModal(true);
  };

  const updateFilter = (key, value) => {
    if (key === 'category') {
      setFilters(prev => ({
        ...prev,
        [key]: value,
        location: 'All Locations',
        selectedRoom: 'All',
        selectedEquipment: 'All',
        maxCapacity: ''
      }));
      setShowAvailableOnly(false);
    } else if (key === 'location') {
      setFilters(prev => ({ ...prev, [key]: value, selectedRoom: 'All' }));
    } else if (key === 'selectedEquipment') {
      setFilters(prev => ({ ...prev, [key]: value }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const CATEGORIES = ['All', 'Lecture Halls', 'Labs', 'Meeting Rooms', 'Equipment'];
  
  const locationOptions = CATEGORY_LOCATIONS[filters.category] || [];
  const showLocationDropdown = locationOptions.length > 0 && filters.category !== 'All';
  
  const roomMapping = CATEGORY_ROOM_MAPPING[filters.category];
  const roomNumbers = (roomMapping && filters.location !== 'All Locations' && roomMapping[filters.location]) 
    ? roomMapping[filters.location] 
    : [];
  const showRoomNumbers = showLocationDropdown && filters.location !== 'All Locations' && roomNumbers.length > 0;
  
  const showEquipmentList = filters.category === 'Equipment';
  const showMaxCapacity = filters.category === 'All' || filters.category === 'Equipment';

  // Sort bookings by updatedAt descending (most recently updated first)
const sortedBookings = [...bookings].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <div className="dashboard-container">
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="dashboard-grid">
        <div className="left-column">
          <div className="section-header">
            <h2>🔍 Find a Resource</h2>
            <p>Search and book available campus resources</p>
          </div>

          <div className="resource-filters">
            <div className="filter-search">
              <input
                type="text"
                placeholder="🔍 Search by resource name or type..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-categories">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`category-chip ${filters.category === cat ? 'active' : ''}`}
                  onClick={() => updateFilter('category', cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {showLocationDropdown && (
              <div className="filter-row">
                <div className="filter-group">
                  <label>📍 SELECT LOCATION</label>
                  <select 
                    value={filters.location} 
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="filter-select"
                  >
                    {locationOptions.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {showRoomNumbers && (
              <div className="room-numbers-section">
                <div className="room-numbers-title">
                  🏠 {filters.category === 'Lecture Halls' ? 'ROOM NUMBERS' : filters.category === 'Labs' ? 'LAB NUMBERS' : 'MEETING ROOMS'} ({filters.location})
                </div>
                <div className="room-chips">
                  <button
                    className={`room-chip ${filters.selectedRoom === 'All' ? 'active' : ''}`}
                    onClick={() => updateFilter('selectedRoom', 'All')}
                  >
                    All
                  </button>
                  {roomNumbers.map(room => (
                    <button
                      key={room.id}
                      className={`room-chip ${filters.selectedRoom === room.id ? 'active' : ''}`}
                      onClick={() => updateFilter('selectedRoom', room.id)}
                    >
                      {room.name} {room.capacity ? `(Capacity: ${room.capacity})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showEquipmentList && (
              <div className="equipment-list-section">
                <div className="equipment-list-header">
                  <div className="equipment-list-title">📹 EQUIPMENT LIST</div>
                  <label className="available-only-toggle">
                    <input
                      type="checkbox"
                      checked={showAvailableOnly}
                      onChange={(e) => setShowAvailableOnly(e.target.checked)}
                    />
                    Show Available Only
                  </label>
                </div>
                <div className="equipment-chips">
                  <button
                    className={`equipment-chip ${filters.selectedEquipment === 'All' ? 'active' : ''}`}
                    onClick={() => updateFilter('selectedEquipment', 'All')}
                  >
                    All
                  </button>
                  {EQUIPMENT_LIST.map(equipment => (
                    <button
                      key={equipment.id}
                      className={`equipment-chip ${filters.selectedEquipment === equipment.id ? 'active' : ''} ${equipment.available === 0 ? 'disabled' : ''}`}
                      onClick={() => equipment.available > 0 && updateFilter('selectedEquipment', equipment.id)}
                      disabled={equipment.available === 0}
                    >
                      {equipment.name} ({equipment.available} available)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showMaxCapacity && (
              <div className="filter-row">
                <div className="filter-group">
                  <label>📊 MAX CAPACITY (UP TO)</label>
                  <input
                    type="number"
                    placeholder="e.g., 100"
                    value={filters.maxCapacity}
                    onChange={(e) => updateFilter('maxCapacity', e.target.value)}
                    className="filter-input"
                  />
                </div>
              </div>
            )}

            <div className="filter-row" style={{ marginTop: '1rem' }}>
              <button 
                className="clear-filters"
                onClick={() => {
                  setFilters({ search: '', category: 'All', location: 'All Locations', selectedRoom: 'All', selectedEquipment: 'All', maxCapacity: '' });
                  setShowAvailableOnly(false);
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {resources.length === 0 ? (
            <div className="empty-resources">
              <p>No resources match your filters.</p>
              <p className="hint">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="resource-grid">
              {resources.map(resource => (
                <div key={resource.id} className="resource-card">
                  <div className="resource-icon">
                    {resource.type === 'Lecture Halls' && '🏛️'}
                    {resource.type === 'Labs' && '💻'}
                    {resource.type === 'Meeting Rooms' && '📚'}
                    {resource.type === 'Equipment' && '📹'}
                  </div>
                  <div className="resource-info">
                    <h3>{resource.name}</h3>
                    {resource.roomNumber && (
                      <p className="resource-room">🏠 Room: {resource.roomNumber}</p>
                    )}
                    <p className="resource-location">📍 {resource.location}</p>
                    <p className="resource-capacity">👥 Capacity: {resource.capacity} people</p>
                    
                    {resource.type === 'Equipment' && (
                      <div className={`equipment-availability ${resource.status !== 'ACTIVE' ? 'unavailable' : ''}`}>
                        {resource.status === 'ACTIVE' ? (
                          <>
                            <p>📊 Available: {resource.availableCount} out of {resource.totalCount}</p>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${(resource.availableCount / resource.totalCount) * 100}%` }}
                              ></div>
                            </div>
                            {resource.availableCount <= 3 && resource.availableCount > 0 && (
                              <div className="low-stock-warning">⚠️ Only {resource.availableCount} items left!</div>
                            )}
                            {resource.availableCount === 0 && (
                              <div className="out-of-stock-warning">❌ Out of Stock - Currently Unavailable</div>
                            )}
                          </>
                        ) : (
                          <>
                            <p>❌ UNAVAILABLE</p>
                            <p className="unavailable-reason">This equipment is currently out of service.</p>
                          </>
                        )}
                      </div>
                    )}
                    
                    {resource.type !== 'Equipment' && (
                      <p className="resource-status">
                        <span className={`status-dot ${resource.status === 'ACTIVE' ? 'active' : 'inactive'}`}></span>
                        <span className={resource.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}>
                          {resource.status}
                        </span>
                      </p>
                    )}
                  </div>
                  <button 
                    className="book-now-btn"
                    onClick={() => handleBookNow(resource)}
                    disabled={resource.status !== 'ACTIVE' || (resource.type === 'Equipment' && resource.availableCount === 0)}
                  >
                    {resource.status !== 'ACTIVE' ? '❌ Unavailable' : '📅 Book Now'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="right-column">
          <div className="section-header">
            <h2>📋 My Upcoming Bookings</h2>
            <p>Manage your booking requests – newest first</p>
          </div>

          {loading ? (
            <div className="loading-skeleton">Loading your bookings...</div>
          ) : sortedBookings.length === 0 ? (
            <div className="empty-state">
              <p>You have no upcoming bookings.</p>
              <p className="empty-hint">Use the form to create your first booking.</p>
            </div>
          ) : (
            sortedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isOwner={booking.userEmail === user?.email}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onCancel={handleCancel}
              />
            ))
          )}
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          resource={selectedResource}
          userEmail={user?.email}
          onClose={() => setShowBookingModal(false)}
          onCreate={handleCreate}
        />
      )}

      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

export default MyBookings;