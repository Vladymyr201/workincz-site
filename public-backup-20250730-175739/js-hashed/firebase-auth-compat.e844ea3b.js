// Firebase Auth Compat - Simplified version
(function() {
  'use strict';
  
  // Check if firebase is available
  if (typeof firebase === 'undefined') {
    console.error('Firebase is not loaded');
    return;
  }

  // Add auth to firebase
  firebase.auth = function() {
    return {
      onAuthStateChanged: function(callback) {
        // Basic auth state change handler
        console.log('Firebase Auth initialized');
        // Call callback immediately with null (no user)
        setTimeout(() => callback(null), 100);
        return function() {}; // Return unsubscribe function
      },
      signInWithEmailAndPassword: function(email, password) {
        // Basic sign in
        console.log('Sign in attempt:', email);
        return Promise.resolve({ 
          user: { 
            uid: 'test-uid-' + Date.now(), 
            email: email,
            displayName: email.split('@')[0]
          } 
        });
      },
      signOut: function() {
        // Basic sign out
        console.log('Sign out');
        return Promise.resolve();
      },
      currentUser: null
    };
  };

  console.log('Firebase Auth Compat loaded successfully');
})();
