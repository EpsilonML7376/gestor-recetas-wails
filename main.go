package main

import (
	"embed"
	"fmt"
	"log"

	"GestorRecetasWails/internal/database"
	"GestorRecetasWails/internal/repositories"
	"GestorRecetasWails/internal/services"
	"go.uber.org/zap"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Inicializar logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("error al inicializar logger: %v", err)
	}
	defer func() { _ = logger.Sync() }()

	// Inicializar base de datos SQLite
	if err := database.InitDB(logger); err != nil {
		logger.Fatal("Error al inicializar base de datos", zap.Error(err))
	}
	db := database.GetDB()

	// Repositorios
	recetaRepo := repositories.NewRecetaRepository(db)
	clienteRepo := repositories.NewClienteRepository(db, logger)
	doctorRepo := repositories.NewDoctorRepository(db)
	mutualRepo := repositories.NewMutualRepository(db)

	// Servicios
	recetaService := services.NewRecetaService(recetaRepo, logger)
	clienteService := services.NewClienteService(clienteRepo, logger)
	doctorService := services.NewDoctorService(doctorRepo, logger)
	mutualService := services.NewMutualService(mutualRepo, logger)

	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err = wails.Run(&options.App{
		Title:            "Gestor de Recetas",
		Width:            1024,
		Height:           768,
		WindowStartState: options.Maximised,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisablePinchZoom:     true,
		},
		Bind: []interface{}{
			app,
			recetaService,
			clienteService,
			doctorService,
			mutualService,
		},
	})

	if err != nil {
		fmt.Println("Error:", err.Error())
	}
}
