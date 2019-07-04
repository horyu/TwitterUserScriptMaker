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
    for (const form of document.querySelectorAll('#make-area form')) {
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
datas.swap = (i, j) => {
  [datas[i], datas[j]] = [datas[j], datas[i]];
};


const datas2ifrm = () => {
  ifrm.contentWindow.datas = datas;
  ifrm.contentWindow.datas2oreform();

  arrangeArea.textContent = null;
  for(let i = 0; i < datas.length; i++) {
    const data = datas[i];
    addLi(data, i);
  }
}

const addLi = (() => {
  const makeButton = (text, func) => {
    const btn = makeTag('button', {}, text);
    btn.addEventListener('click', func);
    return btn;
  };

  return (data, index) => {
    const li = makeTag('li', {}, JSON.stringify(data));
    const downBtn = makeButton('↓', () => {
      if (datas[index+1]) {
        datas.swap(index, index+1);
        datas2ifrm();
      }
    });
    const upBtn = makeButton('↑', () => {
      if (datas[index-1]) {
        datas.swap(index-1, index);
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
  };
})();

for (const form of document.querySelectorAll('#make-area form')) {
  // 実際のsubmitを中止
  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
  // makeボタンに機能を追加
  const submit = form.querySelector('input[type="submit"]');
  submit.addEventListener('click', () => {
    const name = form.name;
    const feles = form.elements;
    const value = feles.value.value;
    const data = { name, value };
    switch (name) {
      case 'FixedInputText':
        if (value === '') return;
        datas.push(data);
        break;
      case 'InputText':
        datas.push(data);
        break;
      case 'Textarea':
        const rows = feles.rows.value;
        datas.push({ ...data, rows });
        break;
      case 'ToggleButton':
        if (value === '') return;
        const checked = feles.checked.value;
        datas.push({ ...data, checked});
        break;
      case 'SelectBox':
        if (value === '') return;
        datas.push(data);
        break;
      case 'Datalist':
        if (value === '') return;
        datas.push(data);
        break;
    }
    datas2ifrm();
  });
}

{
  const form = document.getElementById('make-form');
  form.addEventListener('submit', (e) => {
    form.elements.datas.value = JSON.stringify(datas);
  });
}

// textareaの表示がブラウザで異なるため、heightを設定する
{
  for(const textarea of document.querySelectorAll('#make-area textarea')) {
    const rows = parseInt(textarea.getAttribute('rows')) || 2;
    const height = rows + 0.2;
    textarea.style.height = height + 'em';
  }
}
