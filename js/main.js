import { fetchDishesList } from "./getMenuStore.js";

let MENU_STORE = ""; // Вся наша таблица Excel
let BASKET_LIST_STORE = []; // Содержимое корзины. Массив.
let ORDER_LIST = []; // Список заказов. Массив.
let HISTORY_LIST = []; // Список истории заказов. Массив.
const langUser = document.documentElement.lang; // Язык пользователя
const langMain = "ru"; // Главный язык меню
const simvolMoney = "₽"

// const из html
const sendOrderButton = document.querySelector("#sendOrderButton");
const wrapper = document.querySelector(".wrapper");
const dialogBox = document.querySelector(".dialog-box")
const redPointHistory = document.querySelector("#historyPoint");
const redPointShopcase = document.querySelector("#shopcaseButtonPoint");
const buyOrderButton = document.querySelector("#buyOrder");
buyOrderButton.addEventListener("click", () => {
  createDialogBox("requestPaymentMethod", "Выберете способ оплаты");
});

// изменяемые переменные для меню
let tableNumber = 'none';
let orderId = 'none';
let category_active = "";



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
        category_active = category;
      })
    }
  });
  categoriesListDiv.querySelector("button").className = "button_active";
  renderMenu(categoriesListDiv.querySelector("button").innerText);
  category_active = categoriesListDiv.querySelector("button").innerText;
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
const iconShopcase = document.querySelector("#icon");
const shopcaseButton = document.querySelector(".shopcase-button");
const orderWrapperBox = document.querySelector(".order-wrapper-box")
const orderWrapper = document.querySelector(".order-wrapper");
const orderList = document.querySelector(".order__list");
const showOrderList = document.querySelector("#view-order");
const historyOrderButton = document.querySelector(".historyOrderButton")
const historyWrapper = document.querySelector(".history-wrapper");
const historyBox = document.querySelector(".history-box");
const closeWindowHistoryButton = document.querySelector("#closeHistoryWindow");
const closeWindowOrderButton = document.querySelector("#closeOrderWindow");

shopcaseButton.onclick = function () {
  shopcase.classList.toggle("shopcase_active")

  if (shopcase.classList.contains("shopcase_active")) {
    iconShopcase.classList.remove("fa-basket-shopping");
    iconShopcase.classList.add("fa-xmark");
  }
  else {
    iconShopcase.classList.remove("fa-xmark");
    iconShopcase.classList.add("fa-basket-shopping");
  }
}

showOrderList.onclick = function () {
  orderWrapperBox.classList.add("_active");
  orderWrapper.classList.add("_active");
}

historyOrderButton.onclick = function () {
  historyWrapper.classList.add("_active");
  historyBox.classList.add("_active");
}

closeWindowOrderButton.onclick = function () {
  orderWrapperBox.classList.remove("_active");
  orderWrapper.classList.remove("_active");
}

closeWindowHistoryButton.onclick = function () {
  historyWrapper.classList.remove("_active");
  historyBox.classList.remove("_active");
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
    const quantityPorcionNumber = parseInt(quantitySpan.innerText) + 1;
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
          const quantityPorcionNumber = parseInt(quantitySpan.innerText) - 1;
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
  if (BASKET_LIST_STORE.length > 0) {
    redPointShopcase.innerText = BASKET_LIST_STORE.length;
    redPointShopcase.classList.add("_active");
  } else {
    redPointShopcase.classList.remove("_active");
  }
  console.log(BASKET_LIST_STORE);
  renderBasketCards();
  TotalCostBasketCalculation(BASKET_LIST_STORE, document.getElementById("shopcaseTotalCostNumber"));
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

  if (BASKET_LIST_STORE.length > 0) {
    sendOrderButton.classList.add("_active");
    sendOrderButton.addEventListener("click", () => {
      if (tableNumber == 'none') {
        createDialogBox("requestTableNumber", "Введите номер стола")
      } else {
        createMessageToTelegram('newOrder');
      }

    })
  } else {
    sendOrderButton.classList.remove("_active")
  }


}

function createMessageToTelegram(type, paymentMethod = null) {
  let messageTitle = '';
  let messageHead = '';
  let messageBody = '';
  let messageFooter = '';
  if (type == 'newOrder') {
    const newOrderId = createOrderId().toTg;
    messageTitle = "🟥 Новый заказ"

    messageHead =
      `
🗣 Родной язык посетителя – ${langUser}🇷🇺
🍽️ Стол № – ${tableNumber}
#️⃣ Номер заказа ↴
${newOrderId}                    
      `;
    messageBody = `📝Список блюд:`;
    let disheNumber = 0;
    let basketTotalCost = 0;
    BASKET_LIST_STORE.forEach(basketItem => {
      disheNumber++;
      const porcionTotalCost = basketItem.porcionCost * basketItem.quantityPorcionNumber;
      basketTotalCost += porcionTotalCost;
      messageBody +=
        `
${disheNumber}. ${basketItem.langMainDishesName} (${basketItem.category})
    ${basketItem.porcionName} × ${basketItem.quantityPorcionNumber} = ${porcionTotalCost}${simvolMoney}
        `;
    });
    messageFooter = `💵Стоимость заказа - ${basketTotalCost}${simvolMoney}`;
  }
  const fullMessage = `
${messageTitle}
${messageHead}
${messageBody}
${messageFooter}    
    `
  sendMessageToTg(fullMessage);
  // нужно сделать два типа сообщения: одно это обновление заказа, второе это оплата заказа (не разобрался как делать)
}

function TotalCostBasketCalculation(list, span) {
  const basketTotalCostNumber = document.getElementById("shopcaseTotalCostNumber");
  let basketTotalCostCalculationNumbers = 0;

  list.forEach(cardBasket => {
    basketTotalCostCalculationNumbers += parseInt(cardBasket.porcionCost) * parseInt(cardBasket.quantityPorcionNumber);
  })

  span.innerText = `${basketTotalCostCalculationNumbers} ${simvolMoney}`
}

function createOrderId() {
  // Получаем текущую дату и время
  const now = new Date();

  // Форматируем компоненты даты с добавлением ведущих нулей
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Месяцы 0-11
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // Создаем объект с двумя форматами
  const newOrderId = {
    toTg: `#N${day}_${month}_${year}__${hours}_${minutes}_${seconds}__${tableNumber}`,
    toHtml: `${day}.${month}.${year} ${hours}:${minutes}:${seconds} - ${tableNumber}`
  };

  // Сохраняем в глобальную переменную
  orderId = newOrderId;

  // Возвращаем новый orderId
  return newOrderId;
}

function createTimeOrder() {
  // Получаем текущую дату и время
  const now = new Date();

  // Форматируем компоненты даты с добавлением ведущих нулей
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`

  return time
}

function createTimeOrderHistory() {
  // Получаем текущую дату и время
  const now = new Date();

  // Форматируем компоненты даты с добавлением ведущих нулей
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`

  return time
}

function createDialogBox(type, title) {
  dialogBox.innerHTML = '';

  if (type == "requestTableNumber") {
    dialogBox.innerHTML =
      `
    <h4>${title}</h4>
    <input placeholder="Номер стола" type="text">
    <div class="dialog-box__buttons">
        <button class="send">Отправить</button>
        <button class="close">Отмена</button>
    </div>
    `
    const send = dialogBox.querySelector(".send");
    const close = dialogBox.querySelector(".close");

    send.addEventListener("click", () => {
      const inputText = dialogBox.querySelector("input").value;
      if (inputText == "" && inputText == null) {
        dialogBox.querySelector("h4").innerText = "Введите номер стола корректно!"
      } else {
        tableNumber = inputText;
        createMessageToTelegram("newOrder");
        wrapper.classList.remove("_active");
      }

    });

    close.addEventListener("click", () => {
      wrapper.classList.remove("_active")
    })

    wrapper.classList.add("_active");
  }
  else if (type == "requestPaymentMethod") {
    dialogBox.innerHTML =
      `
    <h4>${title}</h4>
    <div class="dialog-box__buttons">
        <button class="card-payment">Карта💳</button>
        <button class="cash-payment">Наличные💵</button>
        <button class="close">Отмена</button>
    </div>
    `

    const close = dialogBox.querySelector(".close");
    const cardPayment = dialogBox.querySelector(".card-payment");
    const cashPayment = dialogBox.querySelector(".cash-payment");
    cardPayment.addEventListener("click", () => {
      createMessageToTelegram("methodPayment", "card");
    });
    cashPayment.addEventListener("click", () => {
      createMessageToTelegram("methodPayment", "cash");
    });

    close.addEventListener("click", () => {
      wrapper.classList.remove("_active");
    });

    wrapper.classList.add("_active");
  }

}

async function sendMessageToTg(messageText) {
  const chatId = "-4869517272";
  const token = "7155440374:AAF23ryT70cvWDcRKq7RB_LpwPF4MLbbOaM";
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML' // Можно использовать 'MarkdownV2' вместо HTML
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Ошибка отправки:', result);
      return false;
    }

    console.log('Сообщение отправлено:', result);
    BASKET_LIST_STORE.forEach(item => {
      ORDER_LIST.unshift(item);
    });
    BASKET_LIST_STORE = [];
    renderBasketCards();
    TotalCostBasketCalculation(BASKET_LIST_STORE, document.getElementById("shopcaseTotalCostNumber"));
    renderMenu(category_active);
    renderViewOrderCards()
    return true;

  } catch (error) {
    console.error('Ошибка сети:', error);
    return false;
  }
}

function renderViewOrderCards() {
  const order_list = document.querySelector(".order__list")
  orderList.innerHTML = "";

  ORDER_LIST.forEach(item => {
    const cardOrder = document.createElement("div");
    cardOrder.className = "order-card";
    cardOrder.innerHTML =
      `
      <div class="order-card__image">
          <img src="${item.srcImg}" alt="">
          <h3>${item.langUserDishesName} </h3>
          <div class="order-card__time">
              <span id="iconClock"><i class="fa-regular fa-clock"></i></span>
              <span id="timeOrder">${createTimeOrder()}</span>
          </div>
      </div>
      <div class="order-card__info">
          <p><span>${item.porcionName} - </span><span>${item.porcionCost} ${simvolMoney}</span> x <span>${item.quantityPorcionNumber}</span></p>
          <span class="cost">${item.porcionCost * item.quantityPorcionNumber} ${simvolMoney}</span>
      </div>
      `

    orderList.appendChild(cardOrder);


  });
  if (ORDER_LIST.length > 0) {
    buyOrderButton.classList.add("_active");
  } else {
    sendOrderButton.classList.remove("_active")
  }

  const shopcaseBuyButton = document.querySelector("#shopcaseBuyButton");
  if (ORDER_LIST.length > 0) {
    shopcaseBuyButton.classList.add("_active");
  } else {
    shopcaseBuyButton.classList.remove("_active");
  }
  shopcaseBuyButton.addEventListener("click", () => {
    createDialogBox("requestPaymentMethod", "Выберете способ оплаты");
  });

  TotalCostBasketCalculation(ORDER_LIST, document.getElementById("TotalCostOrderList"));
}

