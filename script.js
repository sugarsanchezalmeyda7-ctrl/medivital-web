const productRail = document.querySelector("#product-rail");

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = Number(button.dataset.scroll);
    productRail.scrollBy({ left: direction * productRail.clientWidth * 0.72, behavior: "smooth" });
  });
});