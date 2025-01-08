import React, { useState, useEffect } from 'react';

export default function fetchUsername() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem("user");
    if (storedUsername) {
      // Set the username if it's found in localStorage
      setUsername(storedUsername);
    } else {
      console.error("Username not found in localStorage.");
    }
  }, []); // This effect only runs once, when the component mounts

  return username; // Returning the username
}
