describe("Client", function() {
  it("can create a key generator", function() {
    expect(function() {new KKSS.generator();}).not.toThrow();
  });

  describe("arithmetic over GF(q)", function() {
    describe("addition", function() {
      it("supports the identity", function() {
        expect(KKSS.add(0, 1)).toBe(1);
      });

      it("supports trivial cases", function() {
        expect(KKSS.add(1, 2)).toBe(3);
      });

      it("is supported if in GF(2^n)", function() {
        if (KKSS.order % 2 == 0) {
          expect(KKSS.add(1, 1)).toBe(0);
        }
      });

      it("is fully supported", function() {
        var order = KKSS.order;
        var generatedElements = new Array(order);
        var fieldAccumulator = 0;

        for (var i = 0; i < order; i++) {
          fieldAccumulator = KKSS.add(fieldAccumulator, 1);
          generatedElements[fieldAccumulator] = true;
        }

        for (var i = 0; i < order; i++) {
          expect(generatedElements[i]).toEqualWithMessage(true, i + " not generated");
        }
      });
    });

    describe("multiplication", function() {
      it("supports the identity", function() {
        expect(KKSS.multiply(1, 3)).toBe(3);
      });

      it("supports trivial cases", function() {
        expect(KKSS.multiply(3, 5)).toBe(15);
      });

      it("is supported if in GF(2^n)", function() {
        if (KKSS.order % 2 == 0) {
          expect(KKSS.multiply(1, 2)).toBe(0);
        }
      });
    });

    describe("inverse", function() {
      it("calculates a multiplicative inverse", function() {
        expect(KKSS.inverse(126)).toBe(2);
      });

      it("handles the multiplicative identity, 1", function() {
        expect(KKSS.inverse(1)).toEqual(1);
      });

      it("has inverses that multiply by to 1", function() {
        expect(KKSS.multiply(2, KKSS.inverse(2))).toEqual(1);
        expect(KKSS.multiply(3, KKSS.inverse(3))).toEqual(1);
        expect(KKSS.multiply(126, KKSS.inverse(126))).toEqual(1);
        expect(KKSS.multiply(250, KKSS.inverse(250))).toEqual(1);
      });
    });
  });

  describe("Generator", function() {
    beforeEach(function() {
      this.mockRandom = {
        nextByte: jasmine.createSpy('nextByte').and.returnValue(140)
      };

      this.subject = new KKSS.generator(this.mockRandom);
    });

    describe("polynomial", function() {
      it("generates a representative polynomial of expected degree", function() {
        var degree = 5;
        var poly = this.subject.polynomial(123, degree);
        expect(poly.length).toBe(degree);
      });

      it("uses the secret as the constant coefficient", function() {
        var secret = 123;
        var poly = this.subject.polynomial(secret, 5);
        expect(poly[0]).toBe(secret);
      });
    });

    it("evaluates polynomials", function() {
      var poly = [1, 2, 3];
      expect(this.subject.evaluate(poly, 2)).toBe(17);
    });

    it("operates within the field", function() {
      var poly = [1, 2];
      expect(this.subject.evaluate(poly, 250)).toBe(250);
    });

    describe("decomposition", function() {
      beforeEach(function() {
        this.n = 3;
        this.k = 2;
      });

      it("decomposes a single byte", function() {
        var parts = this.subject.decompose('a', this.k, this.n);
        expect(parts).toEqual([[1, "237"], [2, "126"], [3, "015"]]);
      });

      it("decomposes a multibyte string", function() {
        var parts = this.subject.decompose('aaa', this.k, this.n);
        expect(parts).toEqual([[1, "237237237"], [2, "126126126"], [3, "015015015"]]);
      });

      it("uses new polynomials for each byte", function() {
        this.mockRandom.nextByte.and.returnValues(140, 6, 123, 209);

        var parts = this.subject.decompose('abba', this.k, this.n);
        expect(parts).toEqual([[1, "237104221055"], [2, "126110093013"], [3, "015116216222"]]);
      });
    });
  });
});
