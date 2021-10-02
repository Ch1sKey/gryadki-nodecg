const listOfBarsRep = nodecg.Replicant('listOfBars', { defaultValue: [] })
NodeCG.waitForReplicants(listOfBarsRep).then(() => {
  
  Vue.component('hp-bar', {
    props: ['currentHp', 'maxHp'],
    name: 'hpBar',
    methods: {
      clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
      } 
    },
    computed: {
      barSnakeTranslate() {
        const hpPercentsDamaged = this.clamp(100 - Math.floor(this.currentHp / this.maxHp * 100), 0, 100);
        return `translateX(-${hpPercentsDamaged}%)`;
      }
    },
    template: `
    <div class="bar-container">
      <div :style="{'transform': barSnakeTranslate}" class="bar-snake"></div>
      <div class="bar-text">
        <span id="currentHp">{{currentHp}}</span>/<span
          id="maxHp"
          >{{maxHp}}</span
        >
      </div>
    </div>`
  })

  new Vue({
    el: '#options-container',
    data: () => ({
      listOfBars: [...listOfBarsRep.value] ?? [],
    }),
    mounted() {
      nodecg.listenFor('NEW_BAR', this.addNewBar)
      nodecg.listenFor('UPDATE', () => {
        nodecg.readReplicant('listOfBars', value => {
          this.listOfBars = value;
        })
      })
      listOfBarsRep.on('change', (newValue) => {
        newValue.forEach(item => {
          this.addNewBar(item);
        })
      })
      nodecg.listenFor('REMOVE_BAR', this.removeBar);

      console.log(this.listOfBars)
      this.update();
    },
    methods: {
      ping(index) {
        nodecg.sendMessage('PING', this.listOfBars[index].id);
      },
      addNewBar(barData) {
        if(this.listOfBars.find(bar => bar.id === barData.id)) {
          return;
        }        
        this.listOfBars.push(barData);
        this.update();
      },
      update() {
        nodecg.sendMessage('UPDATE', this.listOfBars);
        listOfBarsRep.value = this.listOfBars;
      },
      //hpPropertyName: 'hp' || 'maxHp'
      changeHp(event, index, hpPropertyName) {
        const value = event.target.value;
        event.target.value = '';
        const number = parseInt(value);
        if(!number) return;
        const bar = this.listOfBars[index];
        if(value.startsWith('-') || value.startsWith('+')) {
          bar[hpPropertyName] = bar[hpPropertyName] + number;
        } else {
          bar[hpPropertyName] = number;
        }
        this.update();    
      },
      changeName(value, index) {
        const bar = this.listOfBars[index];
        bar.name = value;
        this.update();
      },
      removeBar(barId) {
        this.listOfBars = this.listOfBars.filter(item => item.id !== barId);
        this.update();
      },
      reload() {
        this.listOfBars = [];
        this.$nextTick(() => {
          nodecg.sendMessage('RELOAD_BARS');
        })
      },
    }
  })
})

// You can access the NodeCG api anytime from the `window.nodecg` object
// Or just `nodecg` for short. Like this!:
nodecg.log.info('Here\'s an example of using NodeCG\'s logging API!');
