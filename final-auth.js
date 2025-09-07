// Final working Clerk auth
window.addEventListener('load', function() {
    console.log('Page loaded, waiting for Clerk...');
    
    // Wait for Clerk to be ready
    const checkClerk = setInterval(() => {
        if (window.Clerk) {
            console.log('Clerk found!');
            clearInterval(checkClerk);
            setupAuth();
        }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
        if (!window.Clerk) {
            console.error('Clerk failed to load');
            clearInterval(checkClerk);
        }
    }, 10000);
});

async function setupAuth() {
    try {
        console.log('Setting up Clerk auth...');
        
        // Wait for Clerk to be fully ready
        await window.Clerk.load();
        
        console.log('Clerk ready!');
        
        // Setup sign in button
        const signInBtn = document.getElementById('sign-in-btn');
        if (signInBtn) {
            signInBtn.innerHTML = 'Sign In';
            signInBtn.disabled = false;
            signInBtn.onclick = () => {
                console.log('Opening sign in modal...');
                window.Clerk.openSignIn();
            };
        }
        
        // Check if user is signed in
        if (window.Clerk.user) {
            showSignedIn();
        } else {
            showSignedOut();
        }
        
    } catch (error) {
        console.error('Auth setup failed:', error);
        const signInBtn = document.getElementById('sign-in-btn');
        if (signInBtn) {
            signInBtn.innerHTML = 'Auth Error: ' + error.message;
        }
    }
}

function showSignedIn() {
    const signedOut = document.getElementById('clerk-signed-out');
    const signedIn = document.getElementById('clerk-signed-in');
    
    if (signedOut) signedOut.style.display = 'none';
    if (signedIn) signedIn.classList.remove('hidden');
    
    const userButton = document.getElementById('clerk-user-button');
    if (userButton && window.Clerk.user) {
        window.Clerk.mountUserButton(userButton);
    }
}

function showSignedOut() {
    const signedOut = document.getElementById('clerk-signed-out');
    const signedIn = document.getElementById('clerk-signed-in');
    
    if (signedOut) signedOut.style.display = 'block';
    if (signedIn) signedIn.classList.add('hidden');
}

// Export for other scripts
window.clerkAuth = {
    isSignedIn: () => !!window.Clerk?.user,
    getCurrentUser: () => window.Clerk?.user || null,
    signOut: () => window.Clerk?.signOut()
};