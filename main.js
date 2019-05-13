function handleShowToast () {
	app.toast.info('Hello From Toast');
}

function init () {
  app.commands.register('openapi:show-toast', handleShowToast)
}

exports.init = init