let elements = document.querySelector('.g-table-tbody-virtual-holder-inner').querySelectorAll(".g-table-row")
let currentIndex = 0; // 当前触发的元素索引

function triggerClickWithDelay() {
    if (currentIndex >= elements.length) {
        elements = document.querySelector('.g-table-tbody-virtual-holder-inner').querySelectorAll(".g-table-row")
        if (elements.length === 0) {
            console.log("所有元素已触发完毕");
            return;
        }
        currentIndex = 0
    }

    // 获取当前元素
    const element = elements[currentIndex];
    let div = element.querySelector(".css-11dqbsu");
    let svgType = div.querySelector("svg").getAttribute('fill');

    let delay = 20
    if (svgType === "#F04866") {
        div.click()
        console.log(`触发元素 ${ currentIndex + 1 }`);
        // 生成 1~2秒的随机延迟（单位：毫秒）
        delay = Math.random() * 500 + 300; // 1000ms ~ 2000ms
    }
    currentIndex++
    setTimeout(triggerClickWithDelay, delay);
}

// 开始触发流程
triggerClickWithDelay();