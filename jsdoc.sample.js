/**
  * Creates a confetti explosion using the canvas-confetti library.
  * @function
  * @memberof GameBoard
 */
function explodeConfetti() {
    // Create the confetti explosion using the canvas-confetti library
    var duration = 15 * 1000;
    var animationEnd = Date.now() + duration;
    /**
     * Default configuration for confetti particles.
     * @type {object}
     * @property {number} startVelocity - The initial speed of the particles.
     * @property {number} spread - The angle range in degrees for the particles' initial trajectory.
     * @property {number} ticks - The number of animation frames for the particles' movement.
     * @property {number} zIndex - The CSS z-index for the confetti.
    */
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
    * The interval that triggers the confetti explosion.
    * @type {number}
    */
    var interval = setInterval(function () {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        /**
         * The number of particles to generate based on the remaining time.
         * @type {number}
        */
        var particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti(
            Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            })
        );
        confetti(
            Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            })
        );
    }, 250);
}