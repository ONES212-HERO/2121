const calendar = document.getElementById("calendar");
const selectedDateLabel = document.getElementById("selectedDateLabel");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskCategory = document.getElementById("taskCategory");
const aiResult = document.getElementById("aiResult");
const weekCanvas = document.getElementById("weekCanvas");
const monthCanvas = document.getElementById("monthCanvas");

let selectedDate = formatDate(new Date());

renderCalendar(new Date());
loadTasks();
updateStats();
selectedDateLabel.innerText = selectedDate;

function renderCalendar(date) {
    calendar.innerHTML = "";
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) calendar.innerHTML += `<div></div>`;
    for (let day = 1; day <= lastDate; day++) {
        const fullDate = formatDate(new Date(year, month, day));
        const plan = JSON.parse(localStorage.getItem(fullDate));
        const done = plan && plan.tasks.length > 0 && plan.tasks.every(t => t.done);
        calendar.innerHTML += `<div class="day ${done ? "done" : ""} ${fullDate===selectedDate?"selected":""}" onclick="selectDate('${fullDate}')">${day}</div>`;
    }
}

function selectDate(date) {
    selectedDate = date;
    selectedDateLabel.innerText = date;
    renderCalendar(new Date(date));
    loadTasks();
    updateStats();
}

addTaskBtn.addEventListener("click", () => {
    if(!taskInput.value.trim()) return;
    let plan = JSON.parse(localStorage.getItem(selectedDate)) || {tasks:[]};
    plan.tasks.push({text: taskInput.value, category: taskCategory.value, done:false});
    localStorage.setItem(selectedDate, JSON.stringify(plan));
    taskInput.value="";
    loadTasks();
    renderCalendar(new Date(selectedDate));
    updateStats();
});

function loadTasks() {
    taskList.innerHTML="";
    const plan = JSON.parse(localStorage.getItem(selectedDate));
    if(!plan) return;
    plan.tasks.forEach((task,index)=>{
        const li=document.createElement("li");
        li.className="task "+(task.done?"done":"");
        li.innerHTML=`<span onclick="toggleTask(${index})">${task.text} (${task.category})</span>
                      <button onclick="deleteTask(${index})">❌</button>`;
        taskList.appendChild(li);
    });
}

function toggleTask(index){
    const plan=JSON.parse(localStorage.getItem(selectedDate));
    plan.tasks[index].done=!plan.tasks[index].done;
    localStorage.setItem(selectedDate, JSON.stringify(plan));
    loadTasks();
    renderCalendar(new Date(selectedDate));
    updateStats();
}

function deleteTask(index){
    const plan=JSON.parse(localStorage.getItem(selectedDate));
    plan.tasks.splice(index,1);
    localStorage.setItem(selectedDate, JSON.stringify(plan));
    loadTasks();
    renderCalendar(new Date(selectedDate));
    updateStats();
}

function updateStats(){
    document.getElementById("chainCount").innerText=calculateChain();
    drawWeekGraph();
    drawMonthGraph();
}

function calculateChain(){
    let chain=0;
    let d=new Date();
    while(true){
        const key=formatDate(d);
        const plan=JSON.parse(localStorage.getItem(key));
        if(plan && plan.tasks.length>0 && plan.tasks.every(t=>t.done)){
            chain++;
            d.setDate(d.getDate()-1);
        } else break;
    }
    return chain;
}

function drawWeekGraph(){
    const ctx=weekCanvas.getContext("2d");
    ctx.clearRect(0,0,400,120);
    let start=new Date();
    start.setDate(start.getDate()-6);
    let x=10;
    for(let i=0;i<7;i++){
        const key=formatDate(new Date(start.getFullYear(),start.getMonth(),start.getDate()+i));
        const plan=JSON.parse(localStorage.getItem(key));
        let val=(plan && plan.tasks.every(t=>t.done))?1:0;
        ctx.fillStyle=val?"#45cc60":"#ccc";
        ctx.fillRect(x,100-val*100,40,val*100);
        x+=50;
    }
}

function drawMonthGraph(){
    const ctx=monthCanvas.getContext("2d");
    ctx.clearRect(0,0,400,120);
    let today=new Date();
    let start=new Date(today.getFullYear(),today.getMonth(),1);
    let days=today.getDate();
    let x=5;
    for(let i=1;i<=days;i++){
        const key=formatDate(new Date(today.getFullYear(),today.getMonth(),i));
        const plan=JSON.parse(localStorage.getItem(key));
        let val=(plan && plan.tasks.every(t=>t.done))?1:0;
        ctx.fillStyle=val?"#5a3ec8":"#ccc";
        ctx.fillRect(x,100-val*100,8,val*100);
        x+=10;
    }
}

document.getElementById("runAI").addEventListener("click",()=>{
    let score=0;
    let d=new Date();
    for(let i=0;i<7;i++){
        const key=formatDate(new Date(d.getFullYear(),d.getMonth(),d.getDate()-i));
        const plan=JSON.parse(localStorage.getItem(key));
        if(plan && plan.tasks.length>0) score+=plan.tasks.filter(t=>t.done).length/plan.tasks.length;
    }
    let avg=score/7;
    let msg=avg>0.8?"Harika gidiyorsun! 🔥":avg>0.5?"Fena değil, biraz daha disiplin! 💪":"Daha çok çalışman lazım! 🚀";
    aiResult.innerText=msg;
});

document.getElementById("themeToggle").addEventListener("click",()=>{
    document.body.classList.toggle("dark");
});

function formatDate(d){
    return d.toISOString().split("T")[0];
}
