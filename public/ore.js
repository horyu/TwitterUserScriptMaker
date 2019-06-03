//
// Utils
//

const makeUniqueId = () => {
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
    const textNode = document.createTextNode(text);
    node.appendChild(textNode);
  }
  return node;
}

//
// 配置
//

const oreForm = makeTag('form', { id: 'ore-form' });
{
  const oriform = document.getElementById('update-form');
  oriform.insertAdjacentElement('afterend', oreForm);
}

//
// add*
//

const add = {
  FixedInputText: (d) => {
    const ele = makeTag('input', { ...d, type: 'text', class: 'autoSize' });
    ele.disabled = true;
    oreForm.appendChild(ele);
    onInputDelegate({target: ele})
  },

  InputText: (d) => {
    const ele = makeTag('input', { ...d, type: 'text', class: 'autoSize' });
    oreForm.appendChild(ele);
    onInputDelegate({target: ele})
  },

  Textarea: (d) => {
    const {value, ...opts} = d;
    opts.rows = opts.rows || 2;
    const textarea = makeTag('textarea', opts, value);
    oreForm.appendChild(textarea);
  },

  ToggleButton: (d) => {
    const {value, ...opts} = d;
    const checked = opts.checked || false;
    const id = makeUniqueId();
    const input = makeTag('input', { type: 'checkbox', value, id, class: 'ore-tgl' });
    input.checked = (checked.toString().toLowerCase() === 'true');
    const updateValue = () => {
      input.value = input.checked ? value : '';
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
}


//
// 変更Eventでツイート入力欄をアップデート
//

const updateTA = (() => {
  const ta = document.getElementById('status');
  return () => {
    ta.value = '';
    for (const ele of oreForm.childNodes) {
      if (ele.value) {
        ta.value += ele.value;
      }
    }
  };
})();
['input', 'change'].forEach(type => {
  oreForm.addEventListener(type, updateTA);
});

//
// input[type="text"]の幅自動調整
// https://stackoverflow.com/questions/3392493/adjust-width-of-input-field-to-its-input
//

const getInputValueWidth = (() => {
  // https://stackoverflow.com/a/49982135/104380
  const copyNode = (sourceNode, targetNode) => {
    const computedStyle = window.getComputedStyle(sourceNode);
    Array.from(computedStyle).forEach(key => targetNode.style.setProperty(
      key, computedStyle.getPropertyValue(key), computedStyle.getPropertyPriority(key)
    ));
    targetNode.textContent = sourceNode.value || '';
  };

  const setNodeStyle = (node) => {
    node.style.width = 'auto';
    // 10px以下だと小さすぎてやりにくい
    node.style.minWidth = '10px';
    node.style.position = 'absolute';
    node.style.visibility = 'hidden';
    node.style.whiteSpace = 'pre';
  };

  return (inputelm) => {
    const meassureElm = document.createElement('span');
    copyNode(inputelm, meassureElm);
    setNodeStyle(meassureElm);
    document.body.appendChild(meassureElm);
    const width = meassureElm.offsetWidth;
    meassureElm.remove();
    return width;
  };
})();

const onInputDelegate = (e) => {
  if (e.target.classList.contains('autoSize')) {
    e.target.style.width = getInputValueWidth(e.target) + 'px';
  }
}
oreForm.addEventListener('input', onInputDelegate);

//
// datasをoreformに反映させる関数の設定
//

if (typeof win === 'undefined') {
  var win = window;
}

// iframe越しにも利用するため、winに関数を登録
win.datas2oreform = () => {
  oreForm.textContent = null;
  for(const data of win.datas) {
    const func = add[data['name']];
    if (func) {
      func(data);
    } else {
      console.error(`'${data['name']}' does not exsist!`);
    }
  }
  updateTA();
};

if (win.datas) {
  win.datas2oreform();
}
