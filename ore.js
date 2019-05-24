
// 
// Utils
// 

const getUniqueId = () => {
  let id;
  do {
    id = Math.random().toString(36).substr(2, 9);
  } while (document.getElementById(id))
  return id;
};

const makeTag = (tagName, attrs = {}, text = null) => {
  const node = document.createElement(tagName);
  for (let attr in attrs) {
    node.setAttribute(attr, attrs[attr]);
  }
  if (text) {
    textNode = document.createTextNode(text);
    node.appendChild(textNode);
  }
  return node;
}

// 
// add*
// 

var addFixedInputText = (value) => {
  const ele = makeTag('input', { type: 'text', class: 'autoSize', value });
  ele.disabled = true;
  oreForm.appendChild(ele);
  onInputDelegate({target: ele})
};

var addInputText = (value = '', opts = {}) => {
  const ele = makeTag('input',
    Object.assign({ type: 'text', class: 'autoSize', value }, opts)
  );
  oreForm.appendChild(ele);
  onInputDelegate({target: ele})
};

var addTextarea = (value = '', rows = '3') => {
  const textarea = makeTag('textarea', { rows }, value);
  oreForm.appendChild(textarea);
};

var addToggleButton = (value, checked = false) => {
  const id = getUniqueId();
  const input = makeTag('input', { type: 'checkbox', value, id, class: 'ore-tgl' });
  input.checked = (checked.toString().toLowerCase() === 'true');
  const updateValue = () => {
    input.value = input.checked ?  value : '';
  };
  updateValue();
  input.addEventListener('change', updateValue);
  oreForm.appendChild(input);

  const label = makeTag('label', { for: id, class: 'ore-tgl-btn', tabindex: '0' }, value);
  label.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      input.click();
    }
  });
  oreForm.appendChild(label);
}

// 
// 配置
// 

var oreForm = makeTag('form', { id: 'ore-form' });
{
  const oriform = document.getElementById('update-form');
  oriform.insertAdjacentElement('afterend', oreForm);
}


// addFixedInputText('今日のao');
// addToggleButton('（遅刻）');
// addFixedInputText(' 5_');
// addInputText('', { pattern: '[0-9]{3,5}'});
// addFixedInputText(' 12_');
// addInputText('', { pattern: '[0-9]{3,5}'});
// addFixedInputText(' ');
// addTextarea();
// addFixedInputText(' #ルービックキューブ');

// 
// Eventのハンドリング
// 

const ta = document.getElementById('status');
var updateTA = () => {
  ta.value = '';
  for (let ele of oreForm.childNodes) {
    if (ele.value) {
      ta.value += ele.value;
    }
  }
};
updateTA();
['input', 'change'].forEach(type => {
  oreForm.addEventListener(type, updateTA);
});

// 
// input[type="text"]の幅自動調整
// https://stackoverflow.com/questions/3392493/adjust-width-of-input-field-to-its-input
// 

const getInputValueWidth = (() => {
  // https://stackoverflow.com/a/49982135/104380
  const copyNodeStyle = (sourceNode, targetNode) => {
    const computedStyle = window.getComputedStyle(sourceNode);
    Array.from(computedStyle).forEach(key => targetNode.style.setProperty(
      key, computedStyle.getPropertyValue(key), computedStyle.getPropertyPriority(key)
    ));
  }

  const meassureElm = (inputelm) => {
    // create a dummy input element for measurements
    const meassureElm = document.createElement('span');
    // copy the read input's styles to the dummy input
    copyNodeStyle(inputelm, meassureElm);

    // set hard-coded styles needed for propper meassuring 
    meassureElm.style.width = 'auto';
    // 10px以下だと小さすぎてやりにくい
    meassureElm.style.minWidth = '10px';
    meassureElm.style.position = 'absolute';
    meassureElm.style.left = '-9999px';
    meassureElm.style.top = '-9999px';
    meassureElm.style.whiteSpace = 'pre';
    meassureElm.textContent = inputelm.value || '';

    document.body.appendChild(meassureElm);
    const width = meassureElm.offsetWidth;
    meassureElm.remove();
    return width;
  }

  return (input) => {
    return meassureElm(input);
  }
})();

const onInputDelegate = (e) => {
  if (e.target.classList.contains('autoSize')) {
    e.target.style.width = getInputValueWidth(e.target) + 'px';
  }
}
oreForm.addEventListener('input', onInputDelegate);
for (let input of document.querySelectorAll('input.autoSize')) {
  onInputDelegate({target: input})
}
