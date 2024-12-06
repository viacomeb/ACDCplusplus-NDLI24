// Function to create a seagull element
function createSeagull() {
    const seagull = document.createElement('div');
    seagull.classList.add('seagull');

    // Randomize the starting vertical position between middle and top
    const startY = Math.random() * (window.innerHeight * 0.5); // Random value between 0% and 50% of the screen height

    // Set the initial position of the seagull
    seagull.style.top = `${startY}px`;
    seagull.style.left = `-150px`; // Start outside the screen (left)

    document.body.appendChild(seagull);

    // Animate the seagull
    const speed = Math.random() * 5 + 5; // Random speed between 5s and 10s
    const targetX = window.innerWidth + 150; // Move offscreen (right)

    // Animate using requestAnimationFrame
    let currentX = -150;
    function animate() {
        currentX += 2; // Adjust speed increment
        seagull.style.left = `${currentX}px`;

        if (currentX < targetX) {
            requestAnimationFrame(animate);
        } else {
            seagull.remove(); // Remove seagull when it exits the screen
        }
    }
    animate();
}

// Function to spawn seagulls periodically
function startSeagullSpawner() {
    createSeagull(); // Create the first seagull immediately
    setInterval(createSeagull, 2000); // Then spawn a new seagull every 2 seconds
}

// Start seagull spawning after the page loads
document.addEventListener('DOMContentLoaded', () => {
    startSeagullSpawner();
});
