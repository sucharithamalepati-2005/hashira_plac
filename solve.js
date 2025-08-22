// Import the built-in 'fs' (File System) module
const fs = require('fs');

/**
 * Converts a string from an arbitrary base to a decimal number.
 * This function is necessary because JavaScript's built-in parseInt has limits.
 * It handles the base logic correctly, including characters 'a'-'f' for hex, etc.
 * @param {string} value The string to convert.
 * @param {number} base The base of the input string.
 * @returns {number} The decoded decimal number.
 */
function stringToLong(value, base) {
    let result = 0;
    let power = 0;
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz";

    for (let i = value.length - 1; i >= 0; i--) {
        const char = value[i].toLowerCase();
        const digit = chars.indexOf(char);
        if (digit >= base || digit === -1) {
            throw new Error(Invalid digit '${value[i]}' for base ${base});
        }
        result += digit * Math.pow(base, power);
        power++;
    }
    return result;
}

/**
 * Calculates the value of a Lagrange polynomial at a given x.
 * @param {Array<object>} points An array of objects {x, y}.
 * @param {number} xValue The x-value to interpolate at.
 * @returns {number} The interpolated y-value.
 */
function lagrangeInterpolate(points, xValue) {
    const n = points.length;
    let interpolatedY = 0.0;

    for (let j = 0; j < n; j++) {
        let basisPolynomialLj = 1.0;
        for (let i = 0; i < n; i++) {
            if (i !== j) {
                const numerator = xValue - points[i].x;
                const denominator = points[j].x - points[i].x;
                if (denominator === 0) {
                    throw new Error("Invalid data: x-values must be unique.");
                }
                basisPolynomialLj *= numerator / denominator;
            }
        }
        interpolatedY += points[j].y * basisPolynomialLj;
    }
    return interpolatedY;
}

// --- Main execution part of the script ---

// 1. Load the data points from the JSON file
let data;
try {
    const fileContent = fs.readFileSync('data.json', 'utf8');
    data = JSON.parse(fileContent);
} catch (error) {
    console.error(Error: 'data.json' not found or is invalid. Details: ${error.message});
    process.exit(1);
}

// 2. Extract n, k, and parse all points
const n = data.keys.n;
const k = data.keys.k;
let allPoints = [];

for (let i = 1; i <= n; i++) {
    const key = i.toString();
    if (data[key]) {
        const x_val = parseInt(key, 10);
        const base = parseInt(data[key].base, 10);
        const y_encoded = data[key].value;
        const y_decoded = stringToLong(y_encoded, base);
        allPoints.push({x: x_val, y: y_decoded});
    }
}

// 3. Use only the first k points for the interpolation
const interpolationPoints = allPoints.slice(0, k);

console.log(Solving with k = ${k} points:);
interpolationPoints.forEach(p => console.log(`  (x=${p.x}, y=${p.y})`));
console.log("-".repeat(30));

// 4. The "secret c" is the constant term of the polynomial, which is P(0).
const secretC = lagrangeInterpolate(interpolationPoints, 2);

// 5. Print the final result
console.log(The calculated 'secret c' is: ${secretC});