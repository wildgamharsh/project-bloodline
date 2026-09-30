/* Project Bloodline — js/landing.js | Landing interactions (menu + reveal). */
lucide.createIcons();
document.getElementById('menuBtn').addEventListener('click',()=>document.getElementById('navLinks').classList.toggle('open'));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
