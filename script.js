const productRail = document.querySelector("#product-rail");

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = Number(button.dataset.scroll);
    productRail.scrollBy({ left: direction * productRail.clientWidth * 0.72, behavior: "smooth" });
  });
});

const pollQuestions = [
  { name: "tried", title: "¿Has probado MEDIVITAL?", options: ["Sí", "No"] },
  { name: "product", title: "¿Qué producto te gustaría probar?", options: ["Menta", "Jengibre", "Manzanilla", "Todos"] },
  { name: "store", title: "¿Deseas tener nuestro producto en tu tienda?", options: ["Sí", "No", "Quiero más información"] },
  { name: "discovery", title: "¿Cómo conociste nuestro producto?", options: ["Redes sociales", "Recomendación", "Feria o evento", "Otro medio"] },
  { name: "catalog", title: "¿Te gustaría recibir el catálogo MEDIVITAL y nuestras ofertas en tu celular?", options: ["Sí", "No", "Tal vez"] },
];
const pollTotals = pollQuestions.map((question) => ({
  ...question,
  counts: Object.fromEntries(question.options.map((option) => [option, 0])),
}));
const pollDialog = document.querySelector("#poll-dialog");
const pollForm = document.querySelector("#poll-form");
const pollResults = document.querySelector("#poll-results");
const pollChart = document.querySelector("#poll-chart");
let pollParticipants = 0;

document.querySelector("#open-poll").addEventListener("click", () => pollDialog.showModal());
document.querySelector("[data-close-poll]").addEventListener("click", () => pollDialog.close());
pollDialog.addEventListener("click", (event) => {
  if (event.target === pollDialog) pollDialog.close();
});

function renderPollChart() {
  document.querySelector("#participant-count").textContent = pollParticipants;
  document.querySelector(".poll-count").lastChild.textContent = pollParticipants === 1 ? " participante en esta página" : " participantes en esta página";
  pollChart.replaceChildren();

  pollTotals.forEach((question, questionIndex) => {
    const chartQuestion = document.createElement("section");
    chartQuestion.className = "poll-chart-question";

    const title = document.createElement("h4");
    title.textContent = `${String(questionIndex + 1).padStart(2, "0")} / ${question.title}`;
    chartQuestion.append(title);

    const options = document.createElement("ul");
    options.className = "poll-chart-options";
    const maxCount = Math.max(...Object.values(question.counts), 1);

    question.options.forEach((option, optionIndex) => {
      const count = question.counts[option];
      const row = document.createElement("li");
      row.className = "poll-chart-option";

      const label = document.createElement("span");
      label.textContent = option;
      const track = document.createElement("span");
      track.className = "poll-chart-track";
      const bar = document.createElement("span");
      bar.className = `poll-chart-bar color-${optionIndex % 5}`;
      bar.style.width = `${(count / maxCount) * 100}%`;
      track.append(bar);
      const value = document.createElement("strong");
      value.textContent = count;
      row.setAttribute("aria-label", `${option}: ${count} ${count === 1 ? "respuesta" : "respuestas"}`);
      row.append(label, track, value);
      options.append(row);
    });

    chartQuestion.append(options);
    pollChart.append(chartQuestion);
  });
}

pollForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const answers = new FormData(pollForm);
  pollTotals.forEach((question) => {
    question.counts[answers.get(question.name)] += 1;
  });
  pollParticipants += 1;
  renderPollChart();
  pollForm.hidden = true;
  pollResults.hidden = false;
  pollResults.scrollIntoView({ block: "nearest" });
});

document.querySelector("#poll-again").addEventListener("click", () => {
  pollForm.reset();
  pollResults.hidden = true;
  pollForm.hidden = false;
  pollDialog.scrollTop = 0;
  pollForm.querySelector("input").focus();
});