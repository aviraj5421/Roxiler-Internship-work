const {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} = require('../validators/authValidator');

console.log('=== Running Roxiler Validation Rules Verification ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(description, condition) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${description}`);
  } else {
    console.error(`  [FAIL] ${description}`);
  }
}

// 1. Name Validation (Min 20, Max 60 chars)
console.log('1. Testing Name Validation:');
assert('Name with 19 chars fails', validateName('Short Name (19 ch)') !== null);
assert('Name with 20 chars passes', validateName('12345678901234567890') === null);
assert('Name with 40 chars passes', validateName('Alexander Hamilton Consumer Platform Account') === null);
assert('Name with 60 chars passes', validateName('a'.repeat(60)) === null);
assert('Name with 61 chars fails', validateName('a'.repeat(61)) !== null);
assert('Empty name fails', validateName('') !== null);
assert('Non-string name fails', validateName(12345) !== null);

// 2. Address Validation (Max 400 chars)
console.log('\n2. Testing Address Validation:');
assert('Address with 1 char passes', validateAddress('A') === null);
assert('Address with 400 chars passes', validateAddress('x'.repeat(400)) === null);
assert('Address with 401 chars fails', validateAddress('x'.repeat(401)) !== null);
assert('Empty address fails', validateAddress('') !== null);

// 3. Password Validation (8-16 chars, 1 uppercase, 1 special character)
console.log('\n3. Testing Password Validation:');
assert('Password with 7 chars fails', validatePassword('Pass@1') !== null);
assert('Password with 17 chars fails', validatePassword('Password@12345678') !== null);
assert('Password without uppercase fails', validatePassword('password@123') !== null);
assert('Password without special char fails', validatePassword('Password123') !== null);
assert('Valid password "Admin@1234" passes', validatePassword('Admin@1234') === null);
assert('Valid password "User#9999" passes', validatePassword('User#9999') === null);
assert('Valid password with 8 chars "Abc@1234" passes', validatePassword('Abc@1234') === null);
assert('Valid password with 16 chars "Abcdefgh@1234567" passes', validatePassword('Abcdefgh@1234567') === null);

// 4. Email Validation
console.log('\n4. Testing Email Validation:');
assert('Valid email "admin@roxiler.com" passes', validateEmail('admin@roxiler.com') === null);
assert('Invalid email "admin" fails', validateEmail('admin') !== null);
assert('Invalid email "admin@com" fails', validateEmail('admin@com') !== null);
assert('Invalid email "admin@.com" fails', validateEmail('admin@.com') !== null);

// 5. Rating Validation (Integer between 1 and 5)
console.log('\n5. Testing Rating Validation:');
const { validateRating } = require('../validators/ratingValidator');

const testRatingReq = (body) => {
  let status = null;
  let json = null;
  let nextCalled = false;
  const res = {
    status: (s) => { status = s; return res; },
    json: (j) => { json = j; return res; },
  };
  const req = { body, params: {} };
  const next = () => { nextCalled = true; };
  validateRating(req, res, next);
  return { status, json, nextCalled };
};

assert('Rating 0 fails', testRatingReq({ store_id: 1, rating: 0 }).status === 400);
assert('Rating 6 fails', testRatingReq({ store_id: 1, rating: 6 }).status === 400);
assert('Rating 3.5 fails', testRatingReq({ store_id: 1, rating: 3.5 }).status === 400);
assert('Rating 1 passes', testRatingReq({ store_id: 1, rating: 1 }).nextCalled === true);
assert('Rating 5 passes', testRatingReq({ store_id: 1, rating: 5 }).nextCalled === true);
assert('Missing store_id fails', testRatingReq({ rating: 4 }).status === 400);

console.log(`\n========================================`);
console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
console.log(`========================================\n`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
