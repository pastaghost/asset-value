import { Asset } from '@shapeshiftoss/asset-service'
import { AssetValue } from './assetValue'
import { AssetValueFormat, SerializedAssetValue } from './types'

describe('AssetValue', () => {
  describe('Initialization', () => {
    it('should return a new AssetValue instance when initialized with valid AssetValueParams', () => {
      const asset: Asset = {
        assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
        chainId: 'cosmos:osmosis-1',
        symbol: 'gamm/pool/1',
        name: 'Osmosis OSMO/ATOM LP Token',
        precision: 6,
        color: '#750BBB',
        icon: 'https://rawcdn.githack.com/cosmos/chain-registry/master/osmosis/images/osmo.png',
        explorer: 'https://www.mintscan.io/osmosis',
        explorerAddressLink: 'https://www.mintscan.io/osmosis/account/',
        explorerTxLink: 'https://www.mintscan.io/osmosis/txs/',
      }
      const av1 = new AssetValue({ value: '42', asset: asset, format: AssetValueFormat.BASE_UNIT })
      expect(av1).toBeInstanceOf(AssetValue)

      const av2 = new AssetValue({
        value: '42',
        assetId: asset.assetId,
        precision: asset.precision,
        format: AssetValueFormat.BASE_UNIT,
      })
      expect(av2).toBeInstanceOf(AssetValue)
    })

    it('should throw an error when initialized with invalid AssetValueParams', () => {
      const asset: Asset = {
        assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
        chainId: 'cosmos:osmosis-1',
        symbol: 'gamm/pool/1',
        name: 'Osmosis OSMO/ATOM LP Token',
        precision: -1,
        color: '#750BBB',
        icon: 'https://rawcdn.githack.com/cosmos/chain-registry/master/osmosis/images/osmo.png',
        explorer: 'https://www.mintscan.io/osmosis',
        explorerAddressLink: 'https://www.mintscan.io/osmosis/account/',
        explorerTxLink: 'https://www.mintscan.io/osmosis/txs/',
      }
      expect(() => {
        new AssetValue({ value: '42', asset: asset, format: AssetValueFormat.BASE_UNIT })
      }).toThrow(new Error('Cannot initialize AssetValue with invalid asset'))

      expect(() => {
        new AssetValue({
          value: '42',
          asset: { ...asset, assetId: '' },
          format: AssetValueFormat.BASE_UNIT,
        })
      }).toThrow(new Error('Cannot initialize AssetValue with invalid asset'))

      expect(() => {
        new AssetValue({
          value: '42',
          assetId: '',
          precision: asset.precision,
          format: AssetValueFormat.BASE_UNIT,
        })
      }).toThrow(new Error('Cannot initialize AssetValue with invalid asset'))

      expect(() => {
        new AssetValue({
          value: '42',
          assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
          precision: -1,
          format: AssetValueFormat.BASE_UNIT,
        })
      }).toThrow(new Error('Cannot initialize AssetValue with invalid asset'))
    })

    it('should return a new AssetValue instance when initialized with a valid SerializedAssetValue', () => {
      const serialized: SerializedAssetValue =
        '{"a":"cosmos:osmosis-1/ibc:gamm/pool/1","p":18,"v":"42"}|44def74b'
      const av = new AssetValue(serialized)
      expect(av).toBeInstanceOf(AssetValue)
    })

    it('should throw an error when initialized with an invalid SerializedAssetValue', () => {
      /* Modify data after serialization to invalidate the checksum */
      const serialized: SerializedAssetValue =
        '{"a":"cosmos:jankchain-69/ibc:gamm/pool/1","p":18,"v":"42"}|44def74b'
      expect(() => {
        new AssetValue(serialized)
      }).toThrow(new Error('Invalid checksum for SerializedAssetValue'))

      /* No delimiter in serializedAssetValue */
      const serialized2: SerializedAssetValue =
        '{"a":"cosmos:osmosis-1/ibc:gamm/pool/1","p":18,"v":"42"}44def74b'
      expect(() => {
        new AssetValue(serialized2)
      }).toThrow(
        new Error('Cannot initialize AssetValue from improperly-formatted SerializedAssetValue')
      )

      /* Missing field in serializedAssetValue */
      const serialized3: SerializedAssetValue =
        '{"a":"cosmos:osmosis-1/ibc:gamm/pool/1","v":"42"}|44def74b'
      expect(() => {
        new AssetValue(serialized3)
      }).toThrow(new Error('Cannot initialize AssetValue from underspecified SerializedAssetValue'))
    })
  })

  describe('Arithmetic Operations', () => {
    describe('Addition', () => {
      it('should return a new AssetValue instance when adding two AssetValues of the same type', () => {
        const term1 = new AssetValue({
          value: '42',
          assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '69.420',
          assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
          precision: 6,
          format: AssetValueFormat.PRECISION,
        })
        expect(term1.plus(term2)).toBeInstanceOf(AssetValue)
      })

      it('should return a new AssetValue instance when adding two AssetValues with the same assetId and precision', () => {
        const term1 = new AssetValue({
          value: '42',
          assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '69.420',
          assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
          precision: 6,
          format: AssetValueFormat.PRECISION,
        })
        expect(term1.plus(term2)).toBeInstanceOf(AssetValue)
      })

      it('should throw an error when adding two AssetValues with different assetIds and the same precision', () => {
        const term1 = new AssetValue({
          value: '42',
          assetId: 'cosmos:evmos-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '69.420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.PRECISION,
        })
        expect(() => {
          term1.plus(term2)
        }).toThrowError(
          new Error(
            'Cannot add assets of different type (cosmos:osmosis-1/ibc:118 and cosmos:evmos-1/ibc:118)'
          )
        )
      })

      it('should should add two positive assetValues properly', () => {
        const term1 = new AssetValue({
          value: '420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '69',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term3 = new AssetValue({
          value: '42',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.PRECISION,
        })

        expect(term1.plus(term2).toBaseUnit()).toEqual('489')
        expect(term1.plus(term2).toPrecision()).toEqual('0.000489')
        expect(term1.plus(term3).toBaseUnit()).toEqual('42000420')
        expect(term1.plus(term3).toPrecision()).toEqual('42.000420')
      })

      it('should should add two negative assetValues properly', () => {
        const term1 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '-69',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term3 = new AssetValue({
          value: '-42',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.PRECISION,
        })

        expect(term1.plus(term2).toBaseUnit()).toEqual('-489')
        expect(term1.plus(term2).toPrecision()).toEqual('-0.000489')
        expect(term1.plus(term3).toBaseUnit()).toEqual('-42000420')
        expect(term1.plus(term3).toPrecision()).toEqual('-42.000420')
      })

      it('should should add one positive and one negative assetValue properly', () => {
        const term1 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '69',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term3 = new AssetValue({
          value: '42',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.PRECISION,
        })

        expect(term1.plus(term2).toBaseUnit()).toEqual('-351')
        expect(term1.plus(term2).toPrecision()).toEqual('-0.000351')
        expect(term1.plus(term3).toBaseUnit()).toEqual('41999580')
        expect(term1.plus(term3).toPrecision()).toEqual('41.999580')
      })

      it('should throw an error when adding two AssetValues of different types', () => {
        const term1 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '69',
          assetId: 'cosmos:evmos-1/ibc:42069',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })

        expect(() => {
          term1.plus(term2)
        }).toThrow(
          new Error(
            'Cannot add assets of different type (cosmos:evmos-1/ibc:42069 and cosmos:osmosis-1/ibc:118)'
          )
        )
      })
    })
    describe('Subtraction', () => {
      it('should return a new AssetValue instance when subtracting two AssetValues of the same type', () => {
        const term1 = new AssetValue({
          value: '42',
          assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '69.420',
          assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
          precision: 6,
          format: AssetValueFormat.PRECISION,
        })
        expect(term1.minus(term2)).toBeInstanceOf(AssetValue)
      })

      it('should return a new AssetValue instance when subtracting two AssetValues with the same assetId and precision', () => {
        const term1 = new AssetValue({
          value: '42',
          assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '69.420',
          assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
          precision: 6,
          format: AssetValueFormat.PRECISION,
        })
        expect(term1.minus(term2)).toBeInstanceOf(AssetValue)
      })

      it('should throw an error when subtracting two AssetValues with different assetIds and the same precision', () => {
        const term1 = new AssetValue({
          value: '42',
          assetId: 'cosmos:evmos-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '69.420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.PRECISION,
        })
        expect(() => {
          term1.minus(term2)
        }).toThrowError(
          new Error(
            'Cannot subtract assets of different type (cosmos:osmosis-1/ibc:118 and cosmos:evmos-1/ibc:118)'
          )
        )
      })

      it('should should subtract two positive assetValues properly', () => {
        const term1 = new AssetValue({
          value: '420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '69',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term3 = new AssetValue({
          value: '42',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.PRECISION,
        })

        expect(term1.minus(term2).toBaseUnit()).toEqual('351')
        expect(term1.minus(term2).toPrecision()).toEqual('0.000351')
        expect(term1.minus(term3).toBaseUnit()).toEqual('-41999580')
        expect(term1.minus(term3).toPrecision()).toEqual('-41.999580')
      })

      it('should should subtract two negative assetValues properly', () => {
        const term1 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '-69',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term3 = new AssetValue({
          value: '-42',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.PRECISION,
        })

        expect(term1.minus(term2).toBaseUnit()).toEqual('-351')
        expect(term1.minus(term2).toPrecision()).toEqual('-0.000351')
        expect(term1.minus(term3).toBaseUnit()).toEqual('41999580')
        expect(term1.minus(term3).toPrecision()).toEqual('41.999580')
      })

      it('should should subtract one positive and one negative assetValue properly', () => {
        const term1 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '69',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term3 = new AssetValue({
          value: '42',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.PRECISION,
        })

        expect(term1.minus(term2).toBaseUnit()).toEqual('-489')
        expect(term1.minus(term2).toPrecision()).toEqual('-0.000489')
        expect(term1.minus(term3).toBaseUnit()).toEqual('-42000420')
        expect(term1.minus(term3).toPrecision()).toEqual('-42.000420')
      })

      it('should throw an error when subtracting two AssetValues of different types', () => {
        const term1 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '69',
          assetId: 'cosmos:evmos-1/ibc:42069',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })

        expect(() => {
          term1.minus(term2)
        }).toThrow(
          new Error(
            'Cannot subtract assets of different type (cosmos:evmos-1/ibc:42069 and cosmos:osmosis-1/ibc:118)'
          )
        )
      })
    })
    describe('Multiplication', () => {
      it('should return a new AssetValue instance when multiplying two AssetValues of the same type', () => {
        const term1 = new AssetValue({
          value: '42',
          assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = 69

        expect(term1.multipliedBy(term2)).toBeInstanceOf(AssetValue)
      })

      it('should return a new AssetValue instance when multiplying two AssetValues with the same assetId and precision', () => {
        const term1 = new AssetValue({
          value: '42',
          assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = 69

        expect(term1.multipliedBy(term2)).toBeInstanceOf(AssetValue)
      })

      it('should should multiply two positive assetValues properly', () => {
        const term1 = new AssetValue({
          value: '420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = 69
        const term3 = '69'

        expect(term1.multipliedBy(term2).toBaseUnit()).toEqual('28980')
        expect(term1.multipliedBy(term2).toPrecision()).toEqual('0.028980')
        expect(term1.multipliedBy(term3).toBaseUnit()).toEqual('28980')
        expect(term1.multipliedBy(term3).toPrecision()).toEqual('0.028980')
      })

      it('should should multiply two negative assetValues properly', () => {
        const term1 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = -69
        const term3 = '-69'

        expect(term1.multipliedBy(term2).toBaseUnit()).toEqual('28980')
        expect(term1.multipliedBy(term2).toPrecision()).toEqual('0.028980')
        expect(term1.multipliedBy(term3).toBaseUnit()).toEqual('28980')
        expect(term1.multipliedBy(term3).toPrecision()).toEqual('0.028980')
      })

      it('should should multiply one positive and one negative assetValue properly', () => {
        const term1 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = 69
        const term3 = '69'

        expect(term1.multipliedBy(term2).toBaseUnit()).toEqual('-28980')
        expect(term1.multipliedBy(term2).toPrecision()).toEqual('-0.028980')
        expect(term1.multipliedBy(term3).toBaseUnit()).toEqual('-28980')
        expect(term1.multipliedBy(term3).toPrecision()).toEqual('-0.028980')
      })
    })
    describe('Division', () => {
      it('should return a new AssetValue instance when dividing two AssetValues of the same type', () => {
        const term1 = new AssetValue({
          value: '42',
          assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = 69

        expect(term1.dividedBy(term2)).toBeInstanceOf(AssetValue)
      })

      it('should return a new AssetValue instance when dividing two AssetValues with the same assetId and precision', () => {
        const term1 = new AssetValue({
          value: '42',
          assetId: 'cosmos:osmosis-1/ibc:gamm/pool/1',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = 69

        expect(term1.dividedBy(term2)).toBeInstanceOf(AssetValue)
      })

      it('should should divide two positive assetValues properly', () => {
        const term1 = new AssetValue({
          value: '420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = 69
        const term3 = '69'

        expect(term1.dividedBy(term2).toBaseUnit()).toEqual('6')
        expect(term1.dividedBy(term2).toPrecision()).toEqual('0.000006')
        expect(term1.dividedBy(term3).toBaseUnit()).toEqual('6')
        expect(term1.dividedBy(term3).toPrecision()).toEqual('0.000006')
      })

      it('should should divide two negative assetValues properly', () => {
        const term1 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = -69
        const term3 = '-69'

        expect(term1.dividedBy(term2).toBaseUnit()).toEqual('6')
        expect(term1.dividedBy(term2).toPrecision()).toEqual('0.000006')
        expect(term1.dividedBy(term3).toBaseUnit()).toEqual('6')
        expect(term1.dividedBy(term3).toPrecision()).toEqual('0.000006')
      })

      it('should should divide one positive and one negative assetValue properly', () => {
        const term1 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = 69
        const term3 = '69'

        expect(term1.dividedBy(term2).toBaseUnit()).toEqual('-6')
        expect(term1.dividedBy(term2).toPrecision()).toEqual('-0.000006')
        expect(term1.dividedBy(term3).toBaseUnit()).toEqual('-6')
        expect(term1.dividedBy(term3).toPrecision()).toEqual('-0.000006')
      })
    })
  })

  describe('Comparison Operations', () => {
    describe('Greater Than', () => {})
    describe('Greater Than Or Equal To', () => {})
    describe('Less Than', () => {})
    describe('Less Than Or Equal To', () => {})

    describe('Equal To', () => {
      it('should return false for two unequal assetValues of the same type', () => {
        const term1 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })
        const term2 = new AssetValue({
          value: '69',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })

        expect(term1.isEqualTo(term2)).toEqual(false)
      })
      it('should return true for two equal assetValues of the same type', () => {
        const term1 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })

        const term2 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })

        expect(term1.isEqualTo(term2)).toEqual(true)
      })

      it('should throw an error for two assetValues of different types', () => {
        const term1 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })

        const term2 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:evmos-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })

        expect(() => {
          term1.isEqualTo(term2)
        }).toThrow(
          new Error(
            'Cannot compare assets of different type (cosmos:evmos-1/ibc:118 and cosmos:osmosis-1/ibc:118)'
          )
        )
      })
    })

    describe('Negative', () => {
      const term1 = new AssetValue({
        value: '-420',
        assetId: 'cosmos:osmosis-1/ibc:118',
        precision: 6,
        format: AssetValueFormat.BASE_UNIT,
      })
      const term2 = new AssetValue({
        value: '0',
        assetId: 'cosmos:osmosis-1/ibc:118',
        precision: 6,
        format: AssetValueFormat.BASE_UNIT,
      })

      expect(term1.isNegative()).toEqual(true)
      expect(term2.isNegative()).toEqual(false)
    })

    describe('Zero', () => {
      it('should return false for an AssetValue with a non-zero value', () => {
        const term1 = new AssetValue({
          value: '-420',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })

        expect(term1.isZero()).toEqual(false)
      })

      it('should return true for an AssetValue with a zero value', () => {
        const term2 = new AssetValue({
          value: '0',
          assetId: 'cosmos:osmosis-1/ibc:118',
          precision: 6,
          format: AssetValueFormat.BASE_UNIT,
        })

        expect(term2.isZero()).toEqual(true)
      })
    })
  })

  describe('Formatting', () => {
    it('should return a value in base units', () => {
      const term1 = new AssetValue({
        value: '420',
        assetId: 'cosmos:osmosis-1/ibc:118',
        precision: 18,
        format: AssetValueFormat.BASE_UNIT,
      })
      expect(term1.toBaseUnit()).toEqual('420')
    })
    it('should return a value in asset precision when asset precision is less than default precision', () => {
      const term1 = new AssetValue({
        value: '420',
        assetId: 'cosmos:osmosis-1/ibc:118',
        precision: 4,
        format: AssetValueFormat.BASE_UNIT,
      })
      expect(term1.toPrecision()).toEqual('0.0420')
    })

    it('should return a value in default precision when asset precision is greater than default precision and no precision argument is provided', () => {
      const term1 = new AssetValue({
        value: '420',
        assetId: 'cosmos:osmosis-1/ibc:118',
        precision: 7,
        format: AssetValueFormat.BASE_UNIT,
      })
      expect(term1.toPrecision()).toEqual('0.000042')
    })

    it('should return a value in specified precision when precision argument is provided', () => {
      const term1 = new AssetValue({
        value: '420',
        assetId: 'cosmos:osmosis-1/ibc:118',
        precision: 9,
        format: AssetValueFormat.BASE_UNIT,
      })
      expect(term1.toPrecision(18)).toEqual('0.000000420000000000')
    })
  })

  describe('Serialization', () => {
    it('should produce a serialized state', () => {
      const term1 = new AssetValue({
        value: '420',
        assetId: 'cosmos:osmosis-1/ibc:118',
        precision: 6,
        format: AssetValueFormat.BASE_UNIT,
      })
      expect(term1.toSerialized()).toEqual(
        '{"a":"cosmos:osmosis-1/ibc:118","p":6,"v":"420"}|a35b8ad1'
      )
    })
  })

  describe('Method Aliases', () => {
    it('should produce a serialized state', () => {})
  })
})