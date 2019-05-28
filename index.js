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

const ifrm = document.getElementById('ifrm');
{
  const btn = document.getElementById('reset');
  btn.onclick = () => {
    for (const form of document.getElementsByTagName('form')) {
      form.reset();
    }
  };
}
{
  const btn = document.getElementById('reload');
  btn.onclick = () => {
    ifrm.contentDocument.location.reload(true);
  };
}

const arrangeArea = document.getElementById('arrange-area');
const datas = [];

const datas2ifrm = () => {
  ifrm.contentWindow.oreForm.textContent = null;
  arrangeArea.textContent = null;
  for(let i = 0; i < datas.length; i++) {
    const data = datas[i];
    data.func();
    data.node = addLi(data.name, data.value, i);
  }
  ifrm.contentWindow.updateTA();
}

const makeButton = (text, func) => {
  const btn = makeTag('button', {}, text);
  btn.addEventListener('click', func);
  return btn;
};
const addLi = (name, value, index) => {
  const li = makeTag('li', {}, name + ": " + value);
  const downBtn = makeButton('↓', () => {
    if (datas[index+1]) {
      [datas[index], datas[index+1]] = [datas[index+1], datas[index]];
      datas2ifrm();
    }
  });
  const upBtn = makeButton('↑', () => {
    if (datas[index-1]) {
      [datas[index-1], datas[index]] = [datas[index], datas[index-1]];
      datas2ifrm();
    }
  });
  const removeBtn = makeButton('remove', () => {
    datas.splice(index, 1);
    datas2ifrm();
  });
  // DocumentFragmentはinsertAdjacentElementでエラーを起こすので、forEachで回す
  [downBtn, upBtn, removeBtn].forEach(ele => {
    li.insertAdjacentElement('afterbegin', ele);
  })
  arrangeArea.appendChild(li);
  return li;
};

// FixedInputText
// InputText
// Textarea
// ToggleButton

for (const form of document.getElementsByTagName('form')) {
  // 実際のsubmitを中止
  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
  // makeボタンに機能を追加
  const submit = form.querySelector('input[type="submit"]');
  submit.addEventListener('click', () => {
    const feles = form.elements;
    const _func = ifrm.contentWindow['add' + form.name];
    let func;
    const value = feles.value.value;
    const data = {
      name: form.name,
      value
    };
    switch (form.name) {
      case 'FixedInputText':
        if (value === '') return;
        // InputText と同じ処理をするのでbreakしない
      case 'InputText':
        func = () => _func(value);
        datas.push(Object.assign(data, { func }));
        break;
      case 'Textarea':
        const rows = feles.rows.value;
        func = () => _func(value, rows);
        datas.push(Object.assign(data, { rows, func }));
        break;
      case 'ToggleButton':
        if (value === '') return;
        const checked = feles.checked.value;
        func = () => _func(value, checked);
        datas.push(Object.assign(data, { checked, func }));
        break;
    }
    datas2ifrm();
  });
}
