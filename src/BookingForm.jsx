import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient'; // Import Supabase client
import { FormControl, InputLabel, Select, MenuItem, Button, Grid, Typography, TextField, Card, Box } from '@mui/material';

const BookingForm = () => {
  const [cycleCategories, setCycleCategories] = useState([]); // State for cycle categories
  const [cycles, setCycles] = useState([]); // State for available cycles
  const [category, setCategory] = useState(''); // Selected category state
  const [location, setLocation] = useState(''); // Location state
  const [startDate, setStartDate] = useState(null); // Start date
  const [endDate, setEndDate] = useState(null); // End date
  const [startTime, setStartTime] = useState(null); // Start time
  const [endTime, setEndTime] = useState(null); // End time
  const [rentalType, setRentalType] = useState('hourly'); // Rental type (hourly or daily)
  const [error, setError] = useState(''); // Error message
  const [searching, setSearching] = useState(false); // Whether we’re currently searching for availability
  const [selectedCycle, setSelectedCycle] = useState(null); // State to hold selected cycle for payment mock
  const [totalPrice, setTotalPrice] = useState(0); // Total price for selected cycle
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: '',
  }); // Payment fields state

  // Fetch cycle categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('cycle_categories').select('*');
      if (error) {
        console.error('Error fetching categories:', error.message);
      } else {
        setCycleCategories(data); // Set categories to the state if no error
      }
    };
    fetchCategories();
  }, []); // The empty dependency array ensures this runs only once when the component mounts

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleRentalTypeChange = (e) => {
    setRentalType(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(''); // Clear error before searching

    // Validate the form based on rental type
    if (!location || !category) {
      setError('Location and category are required.');
      return;
    }

    if (rentalType === 'daily' && (!startDate || !endDate)) {
      setError('Please select a start and end date for daily rental.');
      return;
    }

    if (rentalType === 'hourly' && (!startTime || !endTime)) {
      setError('Please select a start and end time for hourly rental.');
      return;
    }

    setSearching(true); // Set searching mode on

    // Get location and category UUIDs
    const selectedLocation = cycleCategories.find((loc) => loc.name === location);
    const selectedCategory = cycleCategories.find((cat) => cat.name === category);

    if (!selectedLocation || !selectedCategory) {
      setError('Invalid location or category selected.');
      setSearching(false);
      return;
    }

    const selectedLocationUUID = selectedLocation.id;
    const selectedCategoryUUID = selectedCategory.id;

    // Fetch available cycles based on the selected UUIDs
    const { data, error } = await supabase
      .from('cycles')
      .select('*')
      .eq('location_id', selectedLocationUUID)
      .eq('category_id', selectedCategoryUUID);

    if (error) {
      console.error('Error fetching cycles:', error.message);
    } else {
      setCycles(data); // Set the fetched data as state
    }

    setSearching(false); // Stop searching mode after fetching
  };

  const handleSelectCycle = (cycle) => {
    setSelectedCycle(cycle);
    calculateTotalPrice(cycle); // Calculate the total price once the cycle is selected
  };

  const calculateTotalPrice = (cycle) => {
    let price = 0;
    if (rentalType === 'hourly' && startTime && endTime) {
      const start = new Date(`1970-01-01T${startTime}:00`);
      const end = new Date(`1970-01-01T${endTime}:00`);
      const durationInHours = (end - start) / 1000 / 60 / 60;
      price = cycle.price_per_hour * durationInHours;
    } else if (rentalType === 'daily' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const durationInDays = (end - start) / 1000 / 60 / 60 / 24;
      price = cycle.price_per_day * durationInDays;
    }
    setTotalPrice(price);
  };

  const handlePayment = () => {
    // Handle the payment process here (mocked for now)
    alert(`Payment successful! Total amount: $${totalPrice.toFixed(2)}. Your cycle is reserved.`);
    setSelectedCycle(null); // Clear the selection after payment
  };

  return (
    <div>
      <Typography variant="h5" sx={{ marginBottom: '20px' }}>Book a Cycle</Typography>

      {/* Error Message */}
      {error && <Typography color="error">{error}</Typography>}

      {/* Form */}
      <form onSubmit={handleSearch}>
        {/* Rental Type Selector */}
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Rental Type</InputLabel>
          <Select
            value={rentalType}
            onChange={handleRentalTypeChange}
            label="Rental Type"
            required
          >
            <MenuItem value="hourly">Hourly</MenuItem>
            <MenuItem value="daily">Daily</MenuItem>
          </Select>
        </FormControl>

        {/* Location Selector */}
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Location</InputLabel>
          <Select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            label="Location"
            required
          >
            <MenuItem value="location1">Location 1</MenuItem>
            <MenuItem value="location2">Location 2</MenuItem>
          </Select>
        </FormControl>

        {/* Cycle Category Selector */}
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Cycle Category</InputLabel>
          <Select
            value={category}
            onChange={handleCategoryChange}
            label="Cycle Category"
            required
          >
            {cycleCategories.length > 0 ? (
              cycleCategories.map((cat) => (
                <MenuItem key={cat.id} value={cat.name}>
                  {cat.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No categories available</MenuItem>
            )}
          </Select>
        </FormControl>

        {/* Date and Time Fields */}
        {rentalType === 'hourly' ? (
          <>
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
              <TextField
                label="Start Time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>

            <FormControl fullWidth sx={{ marginBottom: 2 }}>
              <TextField
                label="End Time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </>
        ) : (
          <>
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>

            <FormControl fullWidth sx={{ marginBottom: 2 }}>
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </>
        )}

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Search Availability
        </Button>
      </form>

      {/* Displaying Searching State */}
      {searching && (
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid item xs={12}>
            <Typography variant="h6">Displaying search results...</Typography>
          </Grid>
        </Grid>
      )}

      {/* Display Cycle Cards after search */}
      {cycles.length > 0 && !searching && (
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          {cycles.map((cycle) => (
            <Grid item xs={12} sm={6} md={4} key={cycle.id}>
              <Card sx={{ padding: 2 }}>
                <Typography variant="h6">{cycle.name}</Typography>
                <Typography variant="body2">{cycle.category}</Typography>
                <Typography variant="body2">Price per hour: ${cycle.price_per_hour}</Typography>
                <Typography variant="body2">Price per day: ${cycle.price_per_day}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSelectCycle(cycle)}
                >
                  Select Cycle
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Payment Section */}
      {selectedCycle && (
        <Box sx={{ marginTop: 3, padding: 2, border: '1px solid gray' }}>
          <Typography variant="h6">Total Price: ${totalPrice.toFixed(2)}</Typography>
          <TextField
            label="Card Number"
            value={paymentDetails.cardNumber}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
            fullWidth
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Expiry Date"
            value={paymentDetails.expiry}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })}
            fullWidth
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="CVV"
            value={paymentDetails.cvv}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
            fullWidth
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Cardholder Name"
            value={paymentDetails.cardholderName}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardholderName: e.target.value })}
            fullWidth
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handlePayment}
            sx={{ marginTop: 2 }}
          >
            Pay and Reserve
          </Button>
        </Box>
      )}
    </div>
  );
};

export default BookingForm;











