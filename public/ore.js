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

const checkTrue = (target) => {
  return target.toString().toLowerCase() === 'true'
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
    opts.rows = parseInt(opts.rows) || 2;
    const textarea = makeTag('textarea', opts, value);
    oreForm.appendChild(textarea);
    const height = parseInt(getComputedStyle(textarea)['line-height']) * opts.rows;
    textarea.style.height = (height + 5) + 'px';
  },

  ToggleButton: (d) => {
    const {value, ...opts} = d;
    const checked = opts.checked || false;
    const button = makeTag('button', { type: 'button' }, value);
    button.dataset.tgl = checkTrue(checked);
    const updateValue = () => {
      button.dataset.tgl = !checkTrue(button.dataset.tgl);
      button.value = checkTrue(button.dataset.tgl) ? value : '';
    };
    updateValue();
    button.addEventListener('click', updateValue);
    oreForm.appendChild(button);
  },

  SelectBox: (d) => {
    const select = makeTag('select');
    d.value.split('\n').forEach((value) => {
      const option = makeTag('option', { value }, value);
      select.appendChild(option);
    });
    oreForm.appendChild(select);
  },

  Datalist: (d) => {
    const id = makeUniqueId();
    const ele = makeTag('input', { list: id, class: 'autoSize' });
    oreForm.appendChild(ele);
    const datalist = makeTag('datalist', { id });
    d.value.split('\n').forEach((value) => {
      const option = makeTag('option', { value });
      datalist.appendChild(option);
    });
    oreForm.appendChild(datalist);
    onInputDelegate({target: ele})
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
['input', 'change', 'click'].forEach(type => {
  oreForm.addEventListener(type, updateTA);
});

//
// 最初のfocusable要素をfocus
// 最後のfocusable要素と元のテキストエリアへのTab遷移を設定
//

const setTabFocus = (() => {
  const getFocusableElements = () => Array.from(oreForm.children).filter((ele) => {
    switch (ele.tagName) {
      case 'BUTTON':
      case 'TEXTAREA':
      case 'SELECT':
        return true;
      case 'INPUT':
        return !ele.disabled;
    }
  });
  const ta = document.getElementById('status');

  return () => {
    const focusableEles = getFocusableElements();
    const firstFocusable = focusableEles[0];
    const lastFocusable = focusableEles.slice(-1)[0];
    if (firstFocusable) {
      firstFocusable.focus();
    }
    if (lastFocusable) {
      lastFocusable.addEventListener('keydown', (e) => {
        if ((e.key === 'Tab') && !(e.shiftKey || e.ctrlKey)) {
          e.preventDefault();
          ta.focus();
        }
      });
      ta.addEventListener('keydown', (e) => {
        if ((e.key === 'Tab') && e.shiftKey) {
          e.preventDefault();
          lastFocusable.focus();
        }
      });
    }
  };
})();

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
  setTabFocus();
};

if (win.datas) {
  win.datas2oreform();
}
