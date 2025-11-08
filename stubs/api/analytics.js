const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    // res.status(400).send({
    //     ok: false,
    //     message: 'Сервис недоступен временно'
    // })
    res.send([
        { label: 'Лиды', value: 128, help: '+14% за 7д' },
        { label: 'Заказы', value: 42, help: '+8% за 7д' },
        { label: 'Средний чек', value: '2.3 млн ₽', help: '+3% за 7д' },
        { label: 'Конверсия', value: '6.5%', help: '+0.4 п.п.' },
        { label: 'Конверсия', value: '6.5%', help: '+0.4 п.п.' },
      ])
})

module.exports = router