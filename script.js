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

    // Random speed: lower values move faster
    const speed = Math.random() * 2 + 1; // Random speed multiplier between 1 and 3

    // Animate using requestAnimationFrame
    let currentX = -150;
    function animate() {
        currentX += speed; // Move the seagull based on the speed
        seagull.style.left = `${currentX}px`;

        if (currentX < window.innerWidth + 150) {
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
    setInterval(createSeagull, 5000); // Then spawn a new seagull every 2 seconds
}

// Start seagull spawning after the page loads
document.addEventListener('DOMContentLoaded', () => {
    startSeagullSpawner();
});
