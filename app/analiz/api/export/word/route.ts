import { NextRequest, NextResponse } from 'next/server';
import { 
  Document, 
  Paragraph, 
  HeadingLevel, 
  AlignmentType, 
  TextRun, 
  Packer, 
  BorderStyle,
  WidthType,
  TableRow,
  TableCell,
  Table,
  PageNumber,
  Header,
  Footer,
  ExternalHyperlink,
  Tab,
  HorizontalPositionRelativeFrom,
  HorizontalPositionAlign,
  ImageRun,
  VerticalPositionRelativeFrom,
  VerticalPositionAlign,
  TabStopType,
  TabStopPosition,
  PageOrientation,
  ShadingType,
  Header as HeaderNs,
  ColumnBreak,
  LineRuleType,
  HeightRule
} from 'docx';

// Renk sabitleri
const COLORS = {
  PRIMARY: "FF4444", // Site primary color
  SECONDARY: "1E1E1E", // Site secondary color
  SUCCESS: "4CAF50", // Green color for success
  WARNING: "FF9800", // Orange color for warnings
  DANGER: "F44336", // Red color for danger/errors
  INFO: "2196F3", // Blue color for information
  LIGHT: "ECEFF1", // Light gray
  DARK: "181818", // Darkest shade from the site's dark colors
  WHITE: "FFFFFF",
  BLACK: "000000",
  GRAY: "9E9E9E"
};

// Şiddet seviyelerine göre renkleri belirle
const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase() || 'medium') {
    case 'high':
      return COLORS.DANGER;
    case 'medium':
      return COLORS.WARNING;
    case 'low':
      return COLORS.SUCCESS;
    default:
      return COLORS.INFO;
  }
};

// Çeşitli puan türlerine göre renk ve durum metni belirle
const getScoreInfo = (score: number) => {
  if (score >= 80) {
    return { color: COLORS.SUCCESS, text: "İyi" };
  } else if (score >= 60) {
    return { color: COLORS.WARNING, text: "Orta" };
  } else {
    return { color: COLORS.DANGER, text: "Kritik" };
  }
};

// Word (DOCX) formatındaki raporları oluşturacak API endpoint'i
export async function POST(request: NextRequest) {
  try {
    const analizVerileri = await request.json();
    
    // Rapor oluşturma tarihini hazırla
    const tarih = new Date();
    const formatliTarih = tarih.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Tahmini ömür verileri
    const tahminiOmurKm = analizVerileri.tahminiBilgiler?.tahminiOmur?.km 
      ? analizVerileri.tahminiBilgiler.tahminiOmur.km.toLocaleString('tr-TR') 
      : '0';
    
    const tahminiOmurAy = analizVerileri.tahminiBilgiler?.tahminiOmur?.ay || '0';
    
    // Güvenlik skoru analizi
    const guvenlikSkoru = analizVerileri.analizSonuclari?.guvenlikSkoru || 0;
    const guvenlikInfo = getScoreInfo(guvenlikSkoru);
    
    // Yeni bir Word dokümanı oluştur
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1000,
                right: 1000,
                bottom: 1000,
                left: 1000,
              }
            }
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "LASTİKBENDE",
                      bold: true,
                      size: 24,
                      color: COLORS.PRIMARY
                    }),
                    new TextRun({
                      text: "  |  Lastik Durum Raporu",
                      size: 20,
                      color: COLORS.GRAY
                    }),
                  ],
                  spacing: {
                    after: 200
                  },
                  border: {
                    bottom: {
                      color: COLORS.SECONDARY,
                      style: BorderStyle.SINGLE,
                      size: 1
                    }
                  },
                  tabStops: [
                    {
                      type: TabStopType.RIGHT,
                      position: TabStopPosition.MAX
                    }
                  ]
                })
              ]
            })
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Sayfa ",
                      size: 18,
                      color: COLORS.GRAY
                    }),
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      size: 18,
                      color: COLORS.GRAY
                    }),
                    new TextRun({
                      text: " / ",
                      size: 18,
                      color: COLORS.GRAY
                    }),
                    new TextRun({
                      children: [PageNumber.TOTAL_PAGES],
                      size: 18,
                      color: COLORS.GRAY
                    }),
                    new TextRun({
                      text: `     |     Oluşturulma Tarihi: ${formatliTarih}`,
                      size: 18,
                      color: COLORS.GRAY
                    })
                  ],
                  alignment: AlignmentType.CENTER,
                  border: {
                    top: {
                      color: COLORS.LIGHT,
                      style: BorderStyle.SINGLE,
                      size: 1
                    }
                  },
                  spacing: {
                    before: 200
                  }
                })
              ]
            })
          },
          children: [
            // Başlık ve Özet
            new Paragraph({
              text: 'Lastik Analiz Raporu',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { 
                after: 200,
                before: 400,
                line: 360,
                lineRule: LineRuleType.EXACT
              },
              shading: {
                type: ShadingType.SOLID,
                color: COLORS.PRIMARY,
                fill: COLORS.PRIMARY
              },
              border: {
                top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.PRIMARY },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.PRIMARY },
                left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.PRIMARY },
                right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.PRIMARY },
              },
              bidirectional: true,
              thematicBreak: true,
              children: [
                new TextRun({
                  text: 'Lastik Analiz Raporu',
                  bold: true,
                  color: COLORS.WHITE,
                  size: 36
                })
              ]
            }),
            
            // Özet Tablo
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 25,
                        type: WidthType.PERCENTAGE
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Durum: ",
                              bold: true,
                              size: 24
                            }),
                            new TextRun({
                              text: analizVerileri.analizSonuclari?.genelDurum || "Değerlendirilmedi",
                              size: 24,
                              color: guvenlikInfo.color
                            })
                          ]
                        })
                      ]
                    }),
                    new TableCell({
                      width: {
                        size: 50,
                        type: WidthType.PERCENTAGE
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Güvenlik Skoru: ",
                              bold: true,
                              size: 24
                            }),
                            new TextRun({
                              text: `%${guvenlikSkoru} (${guvenlikInfo.text})`,
                              size: 24,
                              color: guvenlikInfo.color
                            })
                          ]
                        }),
                      ]
                    }),
                    new TableCell({
                      width: {
                        size: 25,
                        type: WidthType.PERCENTAGE
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Aşınma: ",
                              bold: true,
                              size: 24
                            }),
                            new TextRun({
                              text: `%${analizVerileri.analizSonuclari?.asinmaOrani || '0'}`,
                              size: 24
                            })
                          ]
                        })
                      ]
                    })
                  ]
                })
              ],
              width: {
                size: 100,
                type: WidthType.PERCENTAGE
              },
              margins: {
                top: 100,
                bottom: 100,
                left: 100,
                right: 100
              }
            }),
            
            // Boşluk
            new Paragraph({
              text: "",
              spacing: {
                after: 200
              }
            }),
            
            // Lastik Bilgileri Bölümü Başlığı
            new Paragraph({
              children: [
                new TextRun({
                  text: '1. Lastik Bilgileri',
                  bold: true,
                  size: 28,
                  color: COLORS.PRIMARY
                })
              ],
              spacing: { 
                after: 200
              },
              heading: HeadingLevel.HEADING_2,
              thematicBreak: true,
              keepNext: true
            }),
            
            // Lastik Bilgileri Tablosu
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: {
                        type: ShadingType.SOLID,
                        color: COLORS.PRIMARY,
                        fill: COLORS.PRIMARY
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Marka",
                              color: COLORS.WHITE,
                              bold: true
                            })
                          ],
                          alignment: AlignmentType.CENTER
                        })
                      ]
                    }),
                    new TableCell({
                      shading: {
                        type: ShadingType.SOLID,
                        color: COLORS.PRIMARY,
                        fill: COLORS.PRIMARY
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Model",
                              color: COLORS.WHITE,
                              bold: true
                            })
                          ],
                          alignment: AlignmentType.CENTER
                        })
                      ]
                    }),
                    new TableCell({
                      shading: {
                        type: ShadingType.SOLID,
                        color: COLORS.PRIMARY,
                        fill: COLORS.PRIMARY
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Ebat",
                              color: COLORS.WHITE,
                              bold: true
                            })
                          ],
                          alignment: AlignmentType.CENTER
                        })
                      ]
                    }),
                    new TableCell({
                      shading: {
                        type: ShadingType.SOLID,
                        color: COLORS.PRIMARY,
                        fill: COLORS.PRIMARY
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Üretim Yılı",
                              color: COLORS.WHITE,
                              bold: true
                            })
                          ],
                          alignment: AlignmentType.CENTER
                        })
                      ]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: analizVerileri.lastikBilgileri?.marka || "Belirtilmemiş",
                          alignment: AlignmentType.CENTER
                        })
                      ]
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: analizVerileri.lastikBilgileri?.model || "Belirtilmemiş",
                          alignment: AlignmentType.CENTER
                        })
                      ]
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: analizVerileri.lastikBilgileri?.boyut || "Belirtilmemiş",
                          alignment: AlignmentType.CENTER
                        })
                      ]
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: analizVerileri.lastikBilgileri?.uretimYili?.toString() || "Belirtilmemiş",
                          alignment: AlignmentType.CENTER
                        })
                      ]
                    })
                  ]
                })
              ],
              width: {
                size: 100,
                type: WidthType.PERCENTAGE
              }
            }),
            
            // Boşluk
            new Paragraph({
              text: "",
              spacing: {
                after: 300
              }
            }),
            
            // Analiz Sonuçları Bölümü Başlığı
            new Paragraph({
              children: [
                new TextRun({
                  text: '2. Analiz Sonuçları',
                  bold: true,
                  size: 28,
                  color: COLORS.PRIMARY
                })
              ],
              spacing: { 
                after: 200
              },
              heading: HeadingLevel.HEADING_2,
              thematicBreak: true,
              keepNext: true
            }),
            
            // Analiz Sonuçları Tablosu
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 33.33,
                        type: WidthType.PERCENTAGE
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Parametre",
                              bold: true,
                              color: COLORS.WHITE
                            })
                          ]
                        })
                      ],
                      shading: {
                        type: ShadingType.SOLID,
                        color: COLORS.PRIMARY,
                        fill: COLORS.PRIMARY
                      }
                    }),
                    new TableCell({
                      width: {
                        size: 33.33,
                        type: WidthType.PERCENTAGE
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Değer",
                              bold: true,
                              color: COLORS.WHITE
                            })
                          ]
                        })
                      ],
                      shading: {
                        type: ShadingType.SOLID,
                        color: COLORS.PRIMARY,
                        fill: COLORS.PRIMARY
                      }
                    }),
                    new TableCell({
                      width: {
                        size: 33.33,
                        type: WidthType.PERCENTAGE
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Durum",
                              bold: true,
                              color: COLORS.WHITE
                            })
                          ]
                        })
                      ],
                      shading: {
                        type: ShadingType.SOLID,
                        color: COLORS.PRIMARY,
                        fill: COLORS.PRIMARY
                      }
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph("Diş Derinliği")]
                    }),
                    new TableCell({
                      children: [new Paragraph(`${analizVerileri.analizSonuclari?.disDerinligi || '0'} mm`)]
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: analizVerileri.analizSonuclari?.disDerinligi > 3 ? "Yeterli" : "Kritik",
                              color: analizVerileri.analizSonuclari?.disDerinligi > 3 ? COLORS.SUCCESS : COLORS.DANGER
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph("Yanak Durumu")]
                    }),
                    new TableCell({
                      children: [new Paragraph(analizVerileri.analizSonuclari?.yanakDurumu || "Belirtilmemiş")]
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: analizVerileri.analizSonuclari?.yanakDurumu === "Normal" ? "İyi" : "Kontrol Gerekli",
                              color: analizVerileri.analizSonuclari?.yanakDurumu === "Normal" ? COLORS.SUCCESS : COLORS.WARNING
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph("Aşınma Oranı")]
                    }),
                    new TableCell({
                      children: [new Paragraph(`%${analizVerileri.analizSonuclari?.asinmaOrani || '0'}`)]
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: analizVerileri.analizSonuclari?.asinmaOrani < 30 ? "İyi" : 
                                    analizVerileri.analizSonuclari?.asinmaOrani < 70 ? "Orta" : "Kötü",
                              color: analizVerileri.analizSonuclari?.asinmaOrani < 30 ? COLORS.SUCCESS : 
                                     analizVerileri.analizSonuclari?.asinmaOrani < 70 ? COLORS.WARNING : COLORS.DANGER
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph("Güvenlik Skoru")]
                    }),
                    new TableCell({
                      children: [new Paragraph(`%${guvenlikSkoru}`)]
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: guvenlikInfo.text,
                              color: guvenlikInfo.color
                            })
                          ]
                        })
                      ]
                    })
                  ]
                })
              ],
              width: {
                size: 100,
                type: WidthType.PERCENTAGE
              }
            }),
            
            // Boşluk
            new Paragraph({
              text: "",
              spacing: {
                after: 300
              }
            }),
            
            // Tahmini Ömür ve Öneriler Başlığı
            new Paragraph({
              children: [
                new TextRun({
                  text: '3. Tahmini Ömür ve Öneriler',
                  bold: true,
                  size: 28,
                  color: COLORS.PRIMARY
                })
              ],
              spacing: { 
                after: 200
              },
              heading: HeadingLevel.HEADING_2,
              thematicBreak: true,
              keepNext: true
            }),
            
            // Tahmini ömür paragrafı
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Tahmini Kalan Ömür: ',
                  bold: true
                }),
                new TextRun({
                  text: `${tahminiOmurKm} km / ${tahminiOmurAy} ay`,
                  bold: false
                })
              ],
              spacing: { 
                after: 200
              }
            }),
            
            // Önerilen Bakımlar Başlığı (koşullu)
            ...(analizVerileri.tahminiBilgiler?.onerilenBakimlar && 
              analizVerileri.tahminiBilgiler.onerilenBakimlar.length > 0
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Önerilen Bakımlar:',
                        bold: true,
                        size: 24,
                        color: COLORS.PRIMARY
                      })
                    ],
                    spacing: { 
                      after: 100
                    },
                    keepNext: true
                  }),
                  
                  // Her bir bakım önerisi
                  ...analizVerileri.tahminiBilgiler.onerilenBakimlar.map((bakim: string, index: number) => 
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${index+1}. `,
                          bold: true
                        }),
                        new TextRun({
                          text: bakim,
                          bold: false
                        })
                      ],
                      bullet: {
                        level: 0
                      },
                      spacing: { 
                        after: 80
                      }
                    })
                  )
                ]
              : []
            ),
            
            // Boşluk
            new Paragraph({
              text: "",
              spacing: {
                after: 200
              }
            }),
            
            // Tespit Edilen Sorunlar Başlığı (koşullu)
            ...(analizVerileri.tahminiBilgiler?.sorunlar && 
              analizVerileri.tahminiBilgiler.sorunlar.length > 0
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '4. Tespit Edilen Sorunlar',
                        bold: true,
                        size: 28,
                        color: COLORS.PRIMARY
                      })
                    ],
                    spacing: { 
                      after: 100,
                      before: 100
                    },
                    heading: HeadingLevel.HEADING_2,
                    thematicBreak: true,
                    keepNext: true
                  }),
                  
                  // Sorunları tablo olarak göster
                  new Table({
                    rows: [
                      // Başlık satırı
                      new TableRow({
                        children: [
                          new TableCell({
                            width: {
                              size: 20,
                              type: WidthType.PERCENTAGE
                            },
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Tür",
                                    bold: true,
                                    color: COLORS.WHITE
                                  })
                                ]
                              })
                            ],
                            shading: {
                              type: ShadingType.SOLID,
                              color: COLORS.PRIMARY,
                              fill: COLORS.PRIMARY
                            }
                          }),
                          new TableCell({
                            width: {
                              size: 60,
                              type: WidthType.PERCENTAGE
                            },
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Açıklama",
                                    bold: true,
                                    color: COLORS.WHITE
                                  })
                                ]
                              })
                            ],
                            shading: {
                              type: ShadingType.SOLID,
                              color: COLORS.PRIMARY,
                              fill: COLORS.PRIMARY
                            }
                          }),
                          new TableCell({
                            width: {
                              size: 20,
                              type: WidthType.PERCENTAGE
                            },
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Şiddet",
                                    bold: true,
                                    color: COLORS.WHITE
                                  })
                                ]
                              })
                            ],
                            shading: {
                              type: ShadingType.SOLID,
                              color: COLORS.PRIMARY,
                              fill: COLORS.PRIMARY
                            }
                          })
                        ]
                      }),
                      
                      // Her bir sorun için satır
                      ...analizVerileri.tahminiBilgiler.sorunlar.map((sorun: any) => {
                        const sorunAciklamasi = sorun.description || 'Belirtilmemiş';
                        const sorunTipi = sorun.type || 'Genel';
                        const severity = sorun.severity || 'medium';
                        const severityColor = getSeverityColor(severity);
                        
                        const severityText = severity === 'high' ? 'Yüksek' :
                                            severity === 'medium' ? 'Orta' : 'Düşük';
                        
                        return new TableRow({
                          children: [
                            new TableCell({
                              children: [
                                new Paragraph(sorunTipi)
                              ]
                            }),
                            new TableCell({
                              children: [
                                new Paragraph(sorunAciklamasi)
                              ]
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: severityText,
                                      color: severityColor
                                    })
                                  ]
                                })
                              ]
                            })
                          ]
                        });
                      })
                    ],
                    width: {
                      size: 100,
                      type: WidthType.PERCENTAGE
                    }
                  })
                ]
              : []
            ),
            
            // Altbilgi
            new Paragraph({
              children: [
                new TextRun({
                  text: "Bu rapor LastikBende analiz sistemi tarafından otomatik olarak oluşturulmuştur.",
                  italics: true,
                  color: COLORS.GRAY
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { 
                before: 800,
                after: 200
              }
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: "© 2024 LastikBende | Tüm Hakları Saklıdır",
                  color: COLORS.PRIMARY,
                  bold: true,
                  size: 20
                })
              ],
              alignment: AlignmentType.CENTER
            })
          ]
        }
      ]
    });
    
    // Dokümanı Buffer'a dönüştür
    const buffer = await Packer.toBuffer(doc);
    
    // Word dosyasını yanıt olarak döndür
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=lastik-analiz-${Date.now()}.docx`
      }
    });
    
  } catch (error: any) {
    console.error('Word dokümanı oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Word dokümanı oluşturulurken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
} 