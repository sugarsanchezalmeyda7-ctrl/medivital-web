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
const pollStatus = document.querySelector("#poll-status");
const pollSubmit = document.querySelector("#poll-submit");
const backend = window.MEDIVITAL_SUPABASE;
const backendReady = Boolean(
  backend?.url?.startsWith("https://")
  && !backend.url.includes("YOUR_PROJECT_REF")
  && (backend?.publishableKey?.startsWith("sb_publishable_") || backend?.publishableKey?.startsWith("eyJ"))
  && !backend.publishableKey.includes("REPLACE_WITH"),
);
let pollParticipants = 0;
let pollLoading = false;

function setPollStatus(message, isError = false) {
  pollStatus.textContent = message;
  pollStatus.classList.toggle("is-error", isError);
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${backend.url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: backend.publishableKey,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) throw new Error("No se pudo conectar con la encuesta.");
  if (response.status === 204) return null;
  return response.json();
}

async function loadPollResults() {
  const result = await supabaseRequest("rpc/medivital_poll_results", {
    method: "POST",
    body: "{}",
  });

  pollParticipants = Number(result.participants) || 0;
  pollTotals.forEach((question) => {
    question.options.forEach((option) => {
      question.counts[option] = Number(result.counts?.[question.name]?.[option]) || 0;
    });
  });
  renderPollChart();
  pollResults.hidden = false;
}

document.querySelector("#open-poll").addEventListener("click", async () => {
  pollDialog.showModal();
  if (!backendReady) {
    pollSubmit.disabled = true;
    setPollStatus("La encuesta compartida aún no está conectada. Falta configurar el proyecto de base de datos.", true);
    return;
  }

  pollSubmit.disabled = true;
  setPollStatus("Cargando resultados guardados...");
  try {
    await loadPollResults();
    setPollStatus("Resultados acumulados de todas las participaciones.");
    pollSubmit.disabled = false;
  } catch {
    setPollStatus("No se pudieron cargar los resultados. Intenta nuevamente más tarde.", true);
  }
});
document.querySelector("[data-close-poll]").addEventListener("click", () => pollDialog.close());
pollDialog.addEventListener("click", (event) => {
  if (event.target === pollDialog) pollDialog.close();
});

function renderPollChart() {
  document.querySelector("#participant-count").textContent = pollParticipants;
  document.querySelector(".poll-count").lastChild.textContent = pollParticipants === 1 ? " participación acumulada" : " participaciones acumuladas";
  pollChart.replaceChildren();

  pollTotals.forEach((question, questionIndex) => {
    const chartQuestion = document.createElement("section");
    chartQuestion.className = "poll-chart-question";

    const title = document.createElement("h4");
    title.textContent = `${String(questionIndex + 1).padStart(2, "0")} / ${question.title}`;
    chartQuestion.append(title);

    const options = document.createElement("ul");
    options.className = "poll-chart-options";
    const questionTotal = Object.values(question.counts).reduce((total, count) => total + count, 0);

    question.options.forEach((option, optionIndex) => {
      const count = question.counts[option];
      const percentage = questionTotal ? Math.round((count / questionTotal) * 100) : 0;
      const row = document.createElement("li");
      row.className = "poll-chart-option";

      const label = document.createElement("span");
      label.className = `poll-option-label color-${optionIndex % 5}`;
      label.textContent = option;
      const track = document.createElement("span");
      track.className = "poll-chart-track";
      const bar = document.createElement("span");
      bar.className = `poll-chart-bar color-${optionIndex % 5}`;
      bar.style.width = `${percentage}%`;
      track.append(bar);
      const value = document.createElement("strong");
      value.textContent = `${count} · ${percentage}%`;
      row.setAttribute("aria-label", `${option}: ${count} ${count === 1 ? "respuesta" : "respuestas"}, ${percentage}%`);
      row.append(label, track, value);
      options.append(row);
    });

    chartQuestion.append(options);
    pollChart.append(chartQuestion);
  });
}

pollForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!backendReady || pollLoading) return;

  pollLoading = true;
  pollSubmit.disabled = true;
  setPollStatus("Guardando tus respuestas...");
  const answers = new FormData(pollForm);

  try {
    await supabaseRequest("medivital_poll_responses", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        tried: answers.get("tried"),
        product: answers.get("product"),
        store_interest: answers.get("store"),
        discovery: answers.get("discovery"),
        catalog: answers.get("catalog"),
      }),
    });
    await loadPollResults();
    pollForm.hidden = true;
    setPollStatus("Respuesta guardada correctamente.");
    pollResults.scrollIntoView({ block: "nearest" });
  } catch {
    setPollStatus("No se pudo guardar la respuesta. Revisa tu conexión e intenta de nuevo.", true);
  } finally {
    pollLoading = false;
    pollSubmit.disabled = !backendReady;
  }
});

document.querySelector("#poll-again").addEventListener("click", () => {
  pollForm.reset();
  pollForm.hidden = false;
  pollSubmit.disabled = !backendReady;
  setPollStatus("Puedes enviar otra respuesta.");
  pollDialog.scrollTop = 0;
  pollForm.querySelector("input").focus();
});