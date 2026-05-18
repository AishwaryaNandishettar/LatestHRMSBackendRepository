// Quick test to check if environment variables are loaded
console.log('='.repeat(50));
console.log('ENVIRONMENT VARIABLE TEST');
console.log('='.repeat(50));
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Expected:', 'http://localhost:8082');
console.log('='.repeat(50));

if (import.meta.env.VITE_API_BASE_URL === 'http://10.25.14.110:8082') {
  console.log('✅ Configuration is CORRECT!');
} else {
  console.log('❌ Configuration is WRONG! Please restart frontend.');
  console.log('Run: Ctrl+C then npm run dev');
}
