import { fetchDishesList } from "./getMenuStore.js";

let MENU_STORE = ""; // Вся наша таблица Excel
let BASKET_LIST_STORE = []; // Содержимое корзины. Массив.
const langUser = document.documentElement.lang; // Язык пользователя
const langMain = "ru"; // Главный язык меню
const simvolMoney = "₽"


fetchDishesList()
  .then(dishesList => {
    console.log(dishesList);
    MENU_STORE = dishesList;
    renderCategorysButton();
    setTimeout(() => {
      document.querySelector(".preloader").classList.add("hide")
    }, 500);
  })

function renderCategorysButton() {
  const categoriesListDiv = document.querySelector(".categories__list");
  categoriesListDiv.innerHTML = "";
  const categoryAll = new Set();

  MENU_STORE.forEach(menuStoreItem => {
    const category = menuStoreItem[`${langUser}Category`]; // Получаем категорию текущего блюда на языке пользователя

    if (!categoryAll.has(category) && menuStoreItem.inStore == "yes") { // Если НЕ! содержит категорию И доступность блюда равно yes
      const categoryButton = document.createElement("button");
      categoryButton.innerHTML = category;
      categoryAll.add(category);
      categoriesListDiv.appendChild(categoryButton);

      categoryButton.addEventListener("click", () => {
        categoriesListDiv.querySelector(".button_active").classList.remove("button_active");
        categoryButton.classList.add("button_active");
        renderMenu(category);
      })
    }
  });
  categoriesListDiv.querySelector("button").className = "button_active";
  renderMenu(categoriesListDiv.querySelector("button").innerText);
}

function renderMenu(category) {
  const cardListDiv = document.querySelector(".card-list");
  cardListDiv.innerHTML = "";

  MENU_STORE.forEach(menuStoreItem => {
    if (menuStoreItem.inStore == "yes" && category == menuStoreItem[`${langUser}Category`]) {
      const searchResultCardInBasket = BASKET_LIST_STORE.find(basketCard => basketCard.langUserDishesName == menuStoreItem[`${langUser}DishesName`]);
      const menuCardDiv = document.createElement("div");
      
      menuCardDiv.setAttribute("id", menuStoreItem.id);
      if (searchResultCardInBasket) {
        menuCardDiv.className = "card card_active";
      } else {
        menuCardDiv.className = "card";
      }
      menuCardDiv.innerHTML =
        `
      <img src="${menuStoreItem.linkImg}" alt="">
      <div class="card__info">
          <div class="card-name">
            <h2>${menuStoreItem[`${langUser}DishesName`]}</h2>
            <p>${menuStoreItem[`${langUser}Description`]}</p>
          </div>
          <div class="card-porcions">
              
          </div>
      </div>
      `;
      const cardPorcionsDiv = menuCardDiv.querySelector(".card-porcions");
      const porcionNames = [
        menuStoreItem.porcionName1,
        menuStoreItem.porcionName2,
        menuStoreItem.porcionName3,
        menuStoreItem.porcionName4,
        menuStoreItem.porcionName5
      ];
      porcionNames.forEach((porcionName, index) => {
        if (porcionName) {
          const porcionCost = menuStoreItem[`porcionCost${index + 1}`];
          const cardPorcionsItemDiv = document.createElement("div");
          cardPorcionsItemDiv.className = "card-porcions__item";
          cardPorcionsItemDiv.dataset.id = `${menuStoreItem.id}-${porcionCost}`;
          const searchResultCardInBasket = BASKET_LIST_STORE.find(basketCard => basketCard.idPorcion == `${menuStoreItem.id}-${porcionCost}`);
          let numberPorcion = 0;
          if (searchResultCardInBasket) {
            numberPorcion = searchResultCardInBasket.quantityPorcionNumber;
          }
          cardPorcionsItemDiv.innerHTML =
            `
          <p>${porcionName} - ${porcionCost} ${simvolMoney}</p>
          <div class="card-quantity">
              <button class="minus"><i class="fa-solid fa-minus"></i></button>
              <span class="quantity">${numberPorcion}</span>
              <button class="plus"><i class="fa-solid fa-plus"></i></button>
          </div>
          `;
          const buttonMinus = cardPorcionsItemDiv.querySelector(".minus");
          buttonMinus.addEventListener("click", () => {
            updateBasket(
              "menu",
              "minus",
              menuStoreItem[`${langMain}Category`],
              menuStoreItem[`${langMain}DishesName`],
              menuStoreItem[`${langUser}DishesName`],
              porcionName,
              porcionCost,
              menuStoreItem.id,
              `${menuStoreItem.id}-${porcionCost}`,
              menuStoreItem.linkImg,
              cardPorcionsItemDiv.querySelector(".quantity")
            );
          });
          const buttonPlus = cardPorcionsItemDiv.querySelector(".plus");
          buttonPlus.addEventListener("click", () => {
            updateBasket(
              "menu",
              "plus",
              menuStoreItem[`${langMain}Category`],
              menuStoreItem[`${langMain}DishesName`],
              menuStoreItem[`${langUser}DishesName`],
              porcionName,
              porcionCost,
              menuStoreItem.id,
              `${menuStoreItem.id}-${porcionCost}`,
              menuStoreItem.linkImg,
              cardPorcionsItemDiv.querySelector(".quantity")
            );
          });

          cardPorcionsDiv.appendChild(cardPorcionsItemDiv);
        }
      });

      cardListDiv.appendChild(menuCardDiv);
    }
  });
}


const shopcase = document.querySelector(".shopcase");
const shopcaseButton = document.querySelector(".shopcase-button");

shopcaseButton.onclick = function () {
    shopcase.classList.toggle("shopcase_active")
}

function updateBasket(
  buttonType,
  action,
  category,
  langMainDishesName,
  langUserDishesName,
  porcionName,
  porcionCost,
  idCard,
  idPorcion,
  srcImg,
  quantitySpan
) {
  
  const card = document.getElementById(`${idCard}`);
  console.log(card)
  if (action == "plus") {
    const quantityPorcionNumber = parseInt(quantitySpan.innerText)+1;
    if (buttonType == "basket") {
      if (card) {
        const cardQuantitySpan = card.querySelector(`[data-id='${idPorcion}']`).querySelector(".quantity");
        cardQuantitySpan.innerText = quantityPorcionNumber;
      }
    }
    card.classList.add("card_active");
    quantitySpan.innerText = quantityPorcionNumber;
    if (BASKET_LIST_STORE.find(item => item.idPorcion == idPorcion)) {
      BASKET_LIST_STORE.forEach(item => {
        if (item.idPorcion == idPorcion) {
          item.quantityPorcionNumber = quantityPorcionNumber;
        }
      });
    } else {
      const porcionInfo = {
        action,
        category,
        langMainDishesName,
        langUserDishesName,
        porcionName,
        porcionCost,
        idCard,
        idPorcion,
        srcImg,
        quantityPorcionNumber
      };
      BASKET_LIST_STORE.unshift(porcionInfo);
      
    }

  } 
  else { // если нажали на кнопку минус
    if (BASKET_LIST_STORE.find(item => item.idPorcion == idPorcion)) {
      BASKET_LIST_STORE.forEach(item => {
        if (item.idPorcion == idPorcion) {
          const quantityPorcionNumber = parseInt(quantitySpan.innerText)-1;
          if (buttonType == "basket") {
            if (card) {
              const cardQuantitySpan = card.querySelector(`[data-id='${idPorcion}']`).querySelector(".quantity");
              cardQuantitySpan.innerText = quantityPorcionNumber;
            }
          }
          
          quantitySpan.innerText = quantityPorcionNumber;
          item.quantityPorcionNumber = quantityPorcionNumber;

          if (item.quantityPorcionNumber == 0) {
            BASKET_LIST_STORE = BASKET_LIST_STORE.filter(item => item.idPorcion !== idPorcion);
            if (!BASKET_LIST_STORE.find(item => item.langMainDishesName == langMainDishesName)) {
              card.classList.remove("card_active");
            }
          }
        }
      });
    }
  }
  console.log(BASKET_LIST_STORE);
  renderBasketCards();
  TotalCostBasketCalculation();
}

function renderBasketCards() {
    const shopcaseListDiv = document.querySelector(".shopcase__list");
    shopcaseListDiv.innerHTML = "";

    BASKET_LIST_STORE.forEach(item => {
        const cardBasketDiv = document.createElement("div");
        cardBasketDiv.className = "shopcase-card";
        const cardTotalCost = parseInt(item.porcionCost) * parseInt(item.quantityPorcionNumber);
        cardBasketDiv.innerHTML = 
        `
        <div class="shopcase-card__head">
            <img src="${item.srcImg}" alt="">
            <div class="shopcase-card__manager">
                <div class="shopcase-card__buttons">
                    <button class="minus"><i class="fa-solid fa-minus"></i></button>
                    <span class="quantity">${item.quantityPorcionNumber}</span>
                    <button class="plus"><i class="fa-solid fa-plus"></i></button>
                </div>
                <span id="shopcaseCardTotalCost">${cardTotalCost} ${simvolMoney}</span>
            </div>
        </div>
        <div class="card__info">
            <h2>${item.langUserDishesName}</h2>
            <h3>${item.langMainDishesName} (${item.category})</h3>
            <p><span id="shopcaseCardPorcionName">${item.porcionName}</span> - <span id="shopcaseCardPorcionCost">${item.porcionCost} ${simvolMoney}</span></p>
        </div>
        `
        const buttonMinus = cardBasketDiv.querySelector(".minus");
        const buttonPlus = cardBasketDiv.querySelector(".plus");
        buttonMinus.addEventListener("click", () => {
          updateBasket(
            "basket",
            "minus",
            item.category,
            item.langMainDishesName,
            item.langUserDishesName,
            item.porcionName,
            item.porcionCost,
            item.idCard,
            item.idPorcion,
            item.linkImg,
            cardBasketDiv.querySelector(".quantity")
          );
        });
        buttonPlus.addEventListener("click", () => {
          updateBasket(
            "basket",
            "plus",
            item.category,
            item.langMainDishesName,
            item.langUserDishesName,
            item.porcionName,
            item.porcionCost,
            item.idCard,
            item.idPorcion,
            item.linkImg,
            cardBasketDiv.querySelector(".quantity")
          );
        });

        shopcaseListDiv.appendChild(cardBasketDiv);
    });
}

function TotalCostBasketCalculation() {
  const basketTotalCostNumber = document.getElementById("shopcaseTotalCostNumber");
  let basketTotalCostCalculationNumbers = 0;

  BASKET_LIST_STORE.forEach(cardBasket => {
    basketTotalCostCalculationNumbers += parseInt(cardBasket.porcionCost) * parseInt(cardBasket.quantityPorcionNumber);
  })

  basketTotalCostNumber.innerText = `${basketTotalCostCalculationNumbers} ${simvolMoney}`
}

