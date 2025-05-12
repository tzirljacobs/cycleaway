import React, { useState } from 'react';
import supabase from './supabaseClient'; // Import Supabase client

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');  // Default role is customer
  const [name, setName] = useState(''); // Add a name field

  const handleSignUp = async (e) => {
    e.preventDefault();
  
    try {
      // Sign up the user with Supabase Auth
      console.log('Attempting sign-up with email:', email);
      const response = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('Full SignUp Response:', response); // Log full response

      const { user, error } = response.data; // Extract user from response.data
  
      if (error) {
        console.error('Sign-up Error:', error.message); // Log error message for debugging
        alert('Error during sign-up: ' + error.message); // Show error message to user
        return; // Stop if there’s an error
      }

      console.log('User signed up successfully:', user); // Log the user object
      console.log('Complete user object:', user);

      if (user) {
        // If name is not provided, use email as the name (before the @ symbol)
        const userName = name || email.split('@')[0]; // Default to email name if name is empty

        console.log('Inserting user into users table...');
        
        // Insert user data into the users table using the UUID id from Supabase Auth
        const { data, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,         // Set the user's ID (UUID from Supabase Auth)
              email: email,        // Add the email
              password: password,  // Add the password (for testing)
              name: userName,      // Add the name (use email or custom name)
              role: role,          // Set the selected role (either 'customer' or 'employee')
            }
          ]);
  
        console.log('Insert result:', data); // Log insert result
        console.log('Insert error:', insertError); // Log any insert error
  
        if (insertError) {
          console.error('Insert Error:', insertError.message);
          alert('Error inserting user into users table: ' + insertError.message);
        } else {
          console.log('User inserted into users table:', data);
          alert('Sign-up and role insertion successful!');
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };
  
  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {/* Name field - optional */}
        <input
          type="text"
          placeholder="Enter your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        
        {/* Radio buttons to select the role */}
        <label>
          <input
            type="radio"
            value="customer"
            checked={role === 'customer'}
            onChange={() => setRole('customer')}
          />
          Customer
        </label>
        <label>
          <input
            type="radio"
            value="employee"
            checked={role === 'employee'}
            onChange={() => setRole('employee')}
          />
          Employee
        </label>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;
