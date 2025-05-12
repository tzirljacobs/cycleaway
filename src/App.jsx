import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Button, Container, Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import supabase from './supabaseClient'; // Import the Supabase client
import BookingForm from './BookingForm'; // Import BookingForm component

function App() {
  const [bookings, setBookings] = useState([]); // State to store bookings
  const [user, setUser] = useState(null); // State to store logged-in user
  const [userBookings, setUserBookings] = useState([]);  // State to store user's past bookings

  // Create the default Material UI theme (light theme)
  const theme = createTheme({
    palette: {
      mode: 'light', // 'light' for light theme, 'dark' for dark theme
    },
  });

  // UseEffect to manage user session and auth state
  useEffect(() => {
    const fetchUser = async () => {
      const { data: user, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(user);
        console.log('User logged in:', user);
      }
    };

    fetchUser();

    // Subscribe to auth state changes (using a listener)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      console.log("Auth state changed:", event, session);
    });

    return () => {
      if (authListener) {
        console.log("Auth listener cleaned up");
      }
    };
  }, []);

  // Fetch bookings for the logged-in user
  useEffect(() => {
    const fetchBookings = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id);  // Assuming bookings have a user_id field linking to the logged-in user

        if (error) {
          console.error('Error fetching bookings:', error);
        } else {
          setUserBookings(data);
        }
      }
    };

    fetchBookings();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' }}>
          <Typography variant="h4" sx={{ flex: 1, textAlign: 'center' }}>Cycle Booking</Typography>
          {user && (
            <Button variant="contained" color="secondary" onClick={handleLogout}>
              Log Out
            </Button>
          )}
        </Box>

        {/* Main Content */}
        <div className="App">
          {user ? (
            <div>
              {/* Welcome Message */}
              <Typography variant="h5" sx={{ marginBottom: '20px', textAlign: 'center' }}>
                Welcome, {user.email}
              </Typography>

              {/* Display user's past bookings */}
              <h3>Your Past Bookings</h3>
              <ul>
                {userBookings.length > 0 ? (
                  userBookings.map((booking, index) => (
                    <li key={index}>
                      <strong>Cycle:</strong> {booking.cycle_id} - <strong>Location:</strong> {booking.location_id} <br />
                      <strong>Start Time:</strong> {booking.start_date} {booking.start_time} <br />
                      <strong>End Time:</strong> {booking.end_date} {booking.end_time} <br />
                      <hr />
                    </li>
                  ))
                ) : (
                  <p>No bookings found.</p>
                )}
              </ul>

              {/* Display the BookingForm component */}
              <BookingForm />  {/* This will display the BookingForm component */}
            </div>
          ) : (
            <div>
              <h2>Please log in or sign up.</h2>
            </div>
          )}
        </div>
      </Container>
    </ThemeProvider>
  );
}

export default App;
